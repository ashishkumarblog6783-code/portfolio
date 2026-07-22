/**
 * autofill/index.js — Platform Router
 * 
 * Detects which ATS platform a job URL belongs to and routes
 * to the appropriate specialized form filler.
 */

import { chromium } from 'playwright';
import { isLeverUrl, fillLeverForm } from './lever.js';
import { isGreenhouseUrl, fillGreenhouseForm } from './greenhouse.js';
import { fillGenericForm } from './generic.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_DIR = path.join(__dirname, '..', 'data', 'browser_profile');

let activeContext = null;

export function getActiveContext() {
  if (activeContext) {
    try {
      if (activeContext.pages()) {
        return activeContext;
      }
    } catch {
      activeContext = null;
    }
  }
  return null;
}

export async function closeActiveContext() {
  if (activeContext) {
    console.log('[Autofill] Force-closing active browser context to release profile lock...');
    await activeContext.close().catch(() => {});
    activeContext = null;
  }
}

export function setActiveContext(context) {
  activeContext = context;
}

/**
 * Helper: Check if a page looks like a job application form using keyword-scoring heuristics
 */
export async function checkIsFormPage(page) {
  try {
    const url = page.url().toLowerCase();
    // Exclude obvious login/signup/registration URLs
    if (/login|signup|sign-in|sign-up|register/i.test(url)) {
      return false;
    }

    return await page.evaluate(() => {
      // Exclude pages with password inputs (login/signup screens)
      const hasPassword = document.querySelector('input[type="password"]') !== null;
      if (hasPassword) {
        return false;
      }

      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea, input[type="file"]');
      let score = 0;
      inputs.forEach(input => {
        const rect = input.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; // Ignore hidden inputs
        
        const name = (input.getAttribute('name') || '').toLowerCase();
        const id = (input.getAttribute('id') || '').toLowerCase();
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        const type = (input.getAttribute('type') || '').toLowerCase();
        
        if (type === 'file') {
          score += 2; // Resumes are highly indicative of application form
        }
        
        const combined = `${name} ${id} ${placeholder}`;
        if (/name|email|phone|resume|cv|linkedin|github|portfolio|website/i.test(combined)) {
          score += 1;
        }
      });
      return score >= 2;
    });
  } catch {
    return false;
  }
}

/**
 * Helper: Check if the page is a premium subscription or payment wall
 */
async function checkIsPremiumWall(page) {
  try {
    const url = page.url().toLowerCase();
    if (/premium|pricing|checkout|buy-now|subscribe/i.test(url)) {
      return true;
    }
    return await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('remote ok premium') || text.includes('upgrade to premium') || text.includes('pricing plan') || text.includes('plan to buy');
    });
  } catch {
    return false;
  }
}

/**
 * Resolve job listing page to the actual application form page
 */
async function getActualFormPage(page) {
  // Wait for the page to settle
  await page.waitForTimeout(3000);

  let isForm = await checkIsFormPage(page);
  if (isForm) {
    console.log(`[Autofill] Inputs match application form criteria. Already on form page.`);
    return page;
  }

  console.log(`[Autofill] Page doesn't look like an application form yet. Searching for Apply buttons/links...`);

  // Broad set of selectors to try for common Apply buttons/links
  const applySelectors = [
    'a.action-apply', // RemoteOK Apply button
    'a:has-text("Apply for this job")',
    'a:has-text("Apply Now")',
    'button:has-text("Apply Now")',
    'a:has-text("Apply on company website")',
    'a:has-text("Apply on Company Site")',
    'a:has-text("Apply")',
    'button:has-text("Apply")',
    'a[href*="apply"]',
    'a[class*="apply"]',
    'button[class*="apply"]'
  ];

  for (const selector of applySelectors) {
    try {
      const el = await page.$(selector);
      if (el) {
        const isVisible = await el.isVisible().catch(() => false);
        if (isVisible) {
          const href = await el.getAttribute('href').catch(() => null);
          if (href) {
            const currentUrl = page.url();
            const resolvedUrl = new URL(href, currentUrl).toString();
            console.log(`[Autofill] Found apply link: ${resolvedUrl}. Navigating with referer: ${currentUrl}`);
            await page.goto(resolvedUrl, { referer: currentUrl, waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(4000);
            
            // Re-evaluate if we are on a form now
            const isNowForm = await checkIsFormPage(page);
            if (isNowForm) {
              return page;
            }
          } else {
            console.log(`[Autofill] Found apply element (${selector}) without href. Clicking...`);
            
            // Watch for new tab or main page navigation
            const pagePromise = page.context().waitForEvent('page', { timeout: 8000 }).catch(() => null);
            const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => null);
            
            await el.click();
            
            const newPage = await pagePromise;
            if (newPage) {
              console.log(`[Autofill] Click opened a new tab: ${newPage.url()}`);
              await newPage.bringToFront();
              await newPage.waitForLoadState('domcontentloaded').catch(() => {});
              await newPage.waitForTimeout(4000);
              return newPage;
            }
            
            await navPromise;
            await page.waitForTimeout(4000);
            
            // Re-evaluate if we are on a form now
            const isNowForm = await checkIsFormPage(page);
            if (isNowForm) {
              return page;
            }
          }
          break; // Try other methods if this didn't land us on a form
        }
      }
    } catch (e) {
      console.warn(`[Autofill] Selector evaluation failed for ${selector}:`, e.message);
    }
  }

  return page;
}

/**
 * Launch a headful browser, navigate to the job URL, and fill the application form.
 * The browser stays open so the user can review and submit.
 */
export async function smartAutofill(jobUrl, profile, resumePath, coverLetter) {
  if (!jobUrl) {
    return { success: false, actions: [], platform: 'none', message: 'No application URL provided.' };
  }

  // Resolve RemoteOK redirects directly using the API to bypass subscription paywalls
  if (jobUrl.includes('remoteok.com')) {
    console.log('[Autofill] Detected RemoteOK URL. Resolving direct apply URL via API...');
    try {
      const match = jobUrl.match(/remote-jobs\/(\d+)/) || jobUrl.match(/l\/(\d+)/);
      if (match) {
        const jobId = match[1];
        const res = await fetch('https://remoteok.com/api', {
          headers: { 'User-Agent': 'JobApplicationAutomator/1.0' }
        });
        const data = await res.json();
        const found = data.find(item => String(item.id) === String(jobId));
        if (found && found.apply_url) {
          console.log(`[Autofill] Resolved direct apply URL: ${found.apply_url}`);
          jobUrl = found.apply_url;
        }
      }
    } catch (err) {
      console.warn('[Autofill] RemoteOK API resolution failed, using original URL:', err.message);
    }
  }

  console.log(`[Autofill] Processing request for: ${jobUrl}`);

  let context = getActiveContext();

  if (!context) {
    console.log(`[Autofill] Attempting to connect to your MAIN Chrome browser...`);
    try {
      const browser = await chromium.connectOverCDP('http://localhost:9222');
      context = browser.contexts()[0];
      console.log(`[Autofill] Successfully connected to your MAIN Chrome browser!`);
    } catch (cdpErr) {
      console.log(`[Autofill] Main Chrome not available (requires --remote-debugging-port=9222). Launching local Automator profile...`);
      const launchOptions = {
        channel: 'chrome',
        headless: false,
        slowMo: 100,
        viewport: null,
        args: ['--start-maximized'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      };

      try {
        context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
      } catch (e) {
        console.warn('[Autofill] Local profile locked. Falling back to temporary context.', e.message);
        delete launchOptions.channel;
        launchOptions.viewport = { width: 1280, height: 900 };
        context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
      }
    }
    activeContext = context;
  } else {
    console.log(`[Autofill] Re-using existing active browser window! Opening new tab...`);
  }

  let page;
  try {
    page = await context.newPage();
  } catch (err) {
    console.log(`[Autofill] Failed to open new tab (browser might be closed). Re-launching...`);
    activeContext = null;
    const launchOptions = {
      channel: 'chrome',
      headless: false,
      slowMo: 100,
      viewport: null,
      args: ['--start-maximized'],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };
      const browser = await chromium.connectOverCDP('http://localhost:9222').catch(() => null);
      if (browser) {
        context = browser.contexts()[0];
      } else {
        try {
          context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
        } catch (e) {
          delete launchOptions.channel;
          launchOptions.viewport = { width: 1280, height: 900 };
          context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
        }
      }
    activeContext = context;
    page = await context.newPage();
  }

  try {
    await page.bringToFront();
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Resolve dynamic redirects (e.g. from job boards to actual forms)
    let activePage = await getActualFormPage(page);
    let activeUrl = activePage.url();
    console.log(`[Autofill] Active URL after initial check: ${activeUrl}`);

    // Check if the current page is a premium subscription/payment wall
    let isPremium = await checkIsPremiumWall(activePage);
    if (isPremium) {
      console.log(`[Autofill] ⚠️ Detected premium subscription or payment wall.`);
      return {
        success: false,
        actions: [],
        platform: 'none',
        message: 'This job application is locked behind a RemoteOK Premium subscription or payment wall. Please try another job.'
      };
    }

    // If the resolved page is not a form (e.g., login, signup, subscription wall), poll until the user navigates to a form page
    let isForm = await checkIsFormPage(activePage);
    if (!isForm) {
      console.log(`[Autofill] Not on an application form page yet (could be a login/signup wall). Waiting up to 90s for user redirection...`);
      
      const startTime = Date.now();
      const timeoutMs = 90000; // 90 seconds
      let hitPremiumWall = false;
      
      while (Date.now() - startTime < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Scan all open tabs for a matching application form or a premium wall
        const pages = context.pages();
        let foundFormPage = null;
        for (const p of pages) {
          try {
            // Check if any tab hit a premium/payment wall
            const isPPremium = await checkIsPremiumWall(p);
            if (isPPremium) {
              hitPremiumWall = true;
              break;
            }
            
            const isPForm = await checkIsFormPage(p);
            if (isPForm) {
              foundFormPage = p;
              break;
            }
          } catch {
            // Ignore pages that might have closed
          }
        }
        
        if (hitPremiumWall) {
          console.log(`[Autofill] ⚠️ User was redirected to a premium or payment wall.`);
          return {
            success: false,
            actions: [],
            platform: 'none',
            message: 'This job application is locked behind a RemoteOK Premium subscription or payment wall. Please choose another job.'
          };
        }
        
        if (foundFormPage) {
          activePage = foundFormPage;
          activeUrl = activePage.url();
          console.log(`[Autofill] Successfully detected application form page at: ${activeUrl}`);
          isForm = true;
          break;
        }
      }
    }

    // Detect platform based on the final active form page URL
    let platform = 'generic';
    if (isLeverUrl(activeUrl)) platform = 'lever';
    else if (isGreenhouseUrl(activeUrl)) platform = 'greenhouse';

    console.log(`[Autofill] Final detected platform: ${platform} for URL: ${activeUrl}`);

    // Run the appropriate form filler
    let actions = [];
    switch (platform) {
      case 'lever':
        actions = await fillLeverForm(activePage, profile, resumePath, coverLetter);
        break;
      case 'greenhouse':
        actions = await fillGreenhouseForm(activePage, profile, resumePath, coverLetter);
        break;
      default:
        actions = await fillGenericForm(activePage, profile, resumePath, coverLetter);
        break;
    }

    console.log(`[Autofill] Completed ${actions.length} actions on ${platform}`);
    console.log(`[Autofill] ⚠️  Browser left open for user review. DO NOT auto-submit.`);

    return {
      success: true,
      actions,
      platform,
      message: `Form filled using ${platform} handler (${actions.length} fields). Browser is open — please review and submit manually.`
    };

  } catch (err) {
    console.error(`[Autofill] Error:`, err.message);
    let msg = err.message;
    if (msg.includes('existing browser session') || msg.includes('user data directory') || msg.includes('lock')) {
      msg = 'The browser session is currently locked by another open window. We have attempted to release it, but if you still see this, please manually close any other open Chromium windows launched by this app and try again.';
    }
    return {
      success: false,
      actions: [],
      platform: 'none',
      message: `Autofill error: ${msg}`
    };
  }
}
