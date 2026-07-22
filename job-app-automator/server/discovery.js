/**
 * discovery.js — Multi-Source Job Discovery Engine
 * 
 * Scrapes real job boards (Indeed India, LinkedIn public search, RemoteOK API)
 * and monitors Lever/Greenhouse company boards for new openings.
 * Deduplicates results and auto-scores them against the user's profile.
 */

import { chromium } from 'playwright';
import { computeMatchScore, isRelevantJob } from './matcher.js';
import { getApplications, addApplication } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_DIR = path.join(__dirname, 'data', 'browser_profile');

// ═══════════════════════════════════════════════════════════════
// INDEED INDIA SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeIndeed(searchConfig, maxPages = 2) {
  const jobs = [];
  const keywords = (searchConfig.keywords || ['data analyst']).join('+');
  const location = searchConfig.location || 'Bangalore, Karnataka';

  let context;
  let isPersistent = true;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    });
  } catch (lockErr) {
    if (lockErr.message.includes('existing browser session') || lockErr.message.includes('lock')) {
      console.log('[Discovery:Indeed] Persistent profile locked. Falling back to clean session.');
      const browser = await chromium.launch({ headless: true });
      context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      });
      isPersistent = false;
    } else {
      throw lockErr;
    }
  }

  try {

    for (let page = 0; page < maxPages; page++) {
      const start = page * 10;
      const url = `https://in.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}&start=${start}&fromage=1`;
      console.log(`[Discovery:Indeed] Scraping page ${page + 1}: ${url}`);

      const tab = await context.newPage();
      try {
        await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await tab.waitForTimeout(2000);

        const results = await tab.evaluate(() => {
          const cards = document.querySelectorAll('.job_seen_beacon, .jobsearch-ResultsList > li, [data-jk]');
          return Array.from(cards).map(card => {
            const titleEl = card.querySelector('h2.jobTitle a, h2 a, .jobTitle span, a[data-jk]');
            const companyEl = card.querySelector('[data-testid="company-name"], .companyName, .company');
            const locationEl = card.querySelector('[data-testid="text-location"], .companyLocation, .location');
            const snippetEl = card.querySelector('.job-snippet, .heading6, td.snip');
            const linkEl = card.querySelector('h2 a, a[data-jk], a.jcs-JobTitle');

            const title = titleEl?.textContent?.trim() || '';
            const company = companyEl?.textContent?.trim() || '';
            const loc = locationEl?.textContent?.trim() || '';
            const snippet = snippetEl?.textContent?.trim() || '';
            const href = linkEl?.getAttribute('href') || '';

            return { title, company, location: loc, snippet, href };
          }).filter(j => j.title && j.href);
        });

        for (const r of results) {
          const fullUrl = r.href.startsWith('http') ? r.href : `https://in.indeed.com${r.href}`;
          jobs.push({
            title: r.title,
            company: r.company,
            location: r.location,
            description: r.snippet,
            url: fullUrl,
            source: 'Indeed India',
            discoveredAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`[Discovery:Indeed] Page ${page + 1} failed:`, err.message);
      } finally {
        await tab.close();
      }
    }

    if (isPersistent) {
      await context.close().catch(() => {});
    } else {
      const browser = context.browser();
      if (browser) await browser.close().catch(() => {});
    }
  } catch (err) {
    console.error('[Discovery:Indeed] Fatal error:', err.message);
    if (context) await context.close().catch(() => {});
  }

  console.log(`[Discovery:Indeed] Found ${jobs.length} jobs`);
  return jobs;
}

// ═══════════════════════════════════════════════════════════════
// LINKEDIN PUBLIC SEARCH SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeLinkedIn(searchConfig) {
  const jobs = [];
  const keywords = (searchConfig.keywords || ['data analyst']).join(' ');
  const location = searchConfig.location || 'Bangalore';

  let context;
  let isPersistent = true;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    });
  } catch (lockErr) {
    if (lockErr.message.includes('existing browser session') || lockErr.message.includes('lock')) {
      console.log('[Discovery:LinkedIn] Persistent profile locked. Falling back to clean session.');
      const browser = await chromium.launch({ headless: true });
      context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      });
      isPersistent = false;
    } else {
      throw lockErr;
    }
  }

  try {

    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&f_TPR=r86400&position=1&pageNum=0`;
    console.log(`[Discovery:LinkedIn] Scraping: ${url}`);

    const tab = await context.newPage();
    try {
      await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await tab.waitForTimeout(3000);
      // Scroll to load more results
      await tab.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await tab.waitForTimeout(2000);

      const results = await tab.evaluate(() => {
        const cards = document.querySelectorAll('.base-card, .jobs-search__results-list li, .base-search-card');
        return Array.from(cards).slice(0, 25).map(card => {
          const titleEl = card.querySelector('.base-search-card__title, h3');
          const companyEl = card.querySelector('.base-search-card__subtitle, h4');
          const locationEl = card.querySelector('.job-search-card__location, .base-search-card__metadata span');
          const linkEl = card.querySelector('a.base-card__full-link, a');
          const dateEl = card.querySelector('time');

          return {
            title: titleEl?.textContent?.trim() || '',
            company: companyEl?.textContent?.trim() || '',
            location: locationEl?.textContent?.trim() || '',
            href: linkEl?.getAttribute('href') || '',
            posted: dateEl?.getAttribute('datetime') || ''
          };
        }).filter(j => j.title && j.href);
      });

      for (const r of results) {
        jobs.push({
          title: r.title,
          company: r.company,
          location: r.location,
          description: '', // LinkedIn public search has limited snippets
          url: r.href.split('?')[0], // Clean tracking params
          source: 'LinkedIn',
          discoveredAt: new Date().toISOString(),
          postedAt: r.posted
        });
      }
    } catch (err) {
      console.warn('[Discovery:LinkedIn] Scrape failed:', err.message);
    } finally {
      await tab.close();
    }

    if (isPersistent) {
      await context.close().catch(() => {});
    } else {
      const browser = context.browser();
      if (browser) await browser.close().catch(() => {});
    }
  } catch (err) {
    console.error('[Discovery:LinkedIn] Fatal error:', err.message);
    if (context) {
      if (isPersistent) {
        await context.close().catch(() => {});
      } else {
        const browser = context.browser();
        if (browser) await browser.close().catch(() => {});
      }
    }
  }

  console.log(`[Discovery:LinkedIn] Found ${jobs.length} jobs`);
  return jobs;
}

// ═══════════════════════════════════════════════════════════════
// REMOTEOK API (FREE JSON API — most reliable source)
// ═══════════════════════════════════════════════════════════════

async function scrapeRemoteOK(searchConfig) {
  const jobs = [];
  try {
    console.log('[Discovery:RemoteOK] Fetching API...');
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'JobApplicationAutomator/1.0' }
    });
    const data = await res.json();

    // First item is metadata, skip it
    const listings = data.slice(1);
    const keywords = (searchConfig.keywords || ['data', 'analyst']).map(k => k.toLowerCase());

    for (const job of listings) {
      const text = `${job.position || ''} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
      const matches = keywords.some(kw => text.includes(kw));
      if (!matches) continue;

      jobs.push({
        title: job.position || '',
        company: job.company || '',
        location: job.location || 'Remote',
        description: (job.description || '').replace(/<[^>]+>/g, ' ').substring(0, 500),
        url: job.apply_url || (job.url ? (job.url.startsWith('http') ? job.url : `https://remoteok.com${job.url}`) : ''),
        source: 'RemoteOK',
        discoveredAt: new Date().toISOString(),
        postedAt: job.date || '',
        tags: job.tags || []
      });
    }
  } catch (err) {
    console.error('[Discovery:RemoteOK] API error:', err.message);
  }

  console.log(`[Discovery:RemoteOK] Found ${jobs.length} matching jobs`);
  return jobs;
}

// ═══════════════════════════════════════════════════════════════
// WE WORK REMOTELY RSS FEED SCRAPER
// ═══════════════════════════════════════════════════════════════

async function scrapeWWR(searchConfig) {
  const jobs = [];
  try {
    console.log('[Discovery:WeWorkRemotely] Fetching RSS feed...');
    const res = await fetch('https://weworkremotely.com/remote-jobs.rss');
    const xml = await res.text();
    
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
    const keywords = (searchConfig.keywords || ['data', 'analyst']).map(k => k.toLowerCase());
    const cleanCDATA = (str) => str ? str.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim() : '';

    for (const item of items) {
      const itemXml = item[1];
      const titleRaw = cleanCDATA(itemXml.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
      const urlRaw = cleanCDATA(itemXml.match(/<link>([\s\S]*?)<\/link>/i)?.[1]);
      const dateRaw = cleanCDATA(itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]);
      const descRaw = cleanCDATA(itemXml.match(/<description>([\s\S]*?)<\/description>/i)?.[1]);
      
      // Clean HTML from description
      const description = descRaw
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, ' ')
        .substring(0, 1000)
        .replace(/\s+/g, ' ')
        .trim();
      
      const fullText = `${titleRaw} ${description}`.toLowerCase();
      const matches = keywords.some(kw => fullText.includes(kw));
      if (!matches) continue;

      // Extract company and title
      let company = 'WeWorkRemotely';
      let title = titleRaw;
      const colonIdx = titleRaw.indexOf(':');
      if (colonIdx !== -1) {
        company = titleRaw.substring(0, colonIdx).trim();
        title = titleRaw.substring(colonIdx + 1).trim();
      }

      jobs.push({
        title,
        company,
        location: 'Remote',
        description: description.substring(0, 500),
        url: urlRaw,
        source: 'WeWorkRemotely',
        discoveredAt: new Date().toISOString(),
        postedAt: dateRaw
      });
    }
  } catch (err) {
    console.error('[Discovery:WeWorkRemotely] RSS fetch failed:', err.message);
  }

  console.log(`[Discovery:WeWorkRemotely] Found ${jobs.length} matching jobs`);
  return jobs;
}

// ═══════════════════════════════════════════════════════════════
// PLAYWRIGHT MODULAR SCRAPING ENGINE & BOARD LISTINGS
// ═══════════════════════════════════════════════════════════════

async function scrapeWithPlaywright(sourceName, url, selectors, searchConfig, options = {}) {
  const jobs = [];
  let context;
  let isPersistent = true;
  const isHeadless = options.headless !== undefined ? options.headless : true;
  
  try {
    console.log(`[Discovery:${sourceName}] Scraping page: ${url} (headless: ${isHeadless})`);
    try {
      context = await chromium.launchPersistentContext(PROFILE_DIR, {
        channel: 'chrome',
        headless: isHeadless,
        args: ['--start-maximized'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      });
    } catch (lockErr) {
      console.log(`[Discovery:${sourceName}] Persistent profile locked. Falling back to clean session.`);
      const browser = await chromium.launch({ channel: 'chrome', headless: isHeadless });
      context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      });
      isPersistent = false;
    }

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Scroll slightly to trigger lazy-loaded cards
    await page.evaluate(() => window.scrollTo(0, 500)).catch(() => {});
    await page.waitForTimeout(1000);

    let results = await page.evaluate((sel) => {
      let cards = document.querySelectorAll(sel.card);
      if (!cards || cards.length === 0) {
        // Fallback: search for any anchor tags that look like job postings
        const links = Array.from(document.querySelectorAll('a[href*="job"], a[href*="career"], a[href*="position"], a[href*="detail"]'));
        return links.slice(0, 20).map(link => ({
          title: link.textContent?.trim() || '',
          company: '',
          location: '',
          href: link.getAttribute('href') || '',
          snippet: ''
        })).filter(j => j.title && j.title.length > 5 && j.href);
      }

      return Array.from(cards).map(card => {
        const titleEl = card.querySelector(sel.title) || card.querySelector('h1, h2, h3, h4, a');
        const companyEl = card.querySelector(sel.company) || card.querySelector('.company, .org, [class*="company"]');
        const locationEl = card.querySelector(sel.location) || card.querySelector('.location, [class*="loc"]');
        const linkEl = card.querySelector(sel.link) || card.querySelector('a');
        const snippetEl = sel.snippet ? card.querySelector(sel.snippet) : null;

        return {
          title: titleEl?.textContent?.trim() || '',
          company: companyEl?.textContent?.trim() || '',
          location: locationEl?.textContent?.trim() || '',
          href: linkEl?.getAttribute('href') || card.getAttribute('href') || '',
          snippet: snippetEl?.textContent?.trim() || ''
        };
      }).filter(j => j.title && j.href);
    }, selectors);

    for (const r of results) {
      let fullUrl = r.href;
      try {
        fullUrl = r.href.startsWith('http') ? r.href : new URL(r.href, url).toString();
      } catch {
        fullUrl = url;
      }
      const desc = r.snippet || `Job listing from ${sourceName}`;
      
      jobs.push({
        title: r.title,
        company: r.company || sourceName,
        location: r.location || 'Bangalore / Remote',
        description: desc,
        url: fullUrl,
        source: sourceName,
        discoveredAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn(`[Discovery:${sourceName}] Scrape failed:`, err.message);
  } finally {
    if (context) {
      if (isPersistent) {
        await context.close().catch(() => {});
      } else {
        const browser = context.browser();
        if (browser) await browser.close().catch(() => {});
      }
    }
  }

  console.log(`[Discovery:${sourceName}] Found ${jobs.length} jobs`);
  return jobs;
}

async function scrapeZipRecruiter(searchConfig) {
  const keywords = (searchConfig.keywords || ['data analyst']).join(' ');
  const location = searchConfig.location || 'Bangalore';
  const url = `https://www.ziprecruiter.com/jobs-search?search=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
  const selectors = {
    card: '.job_result_card, article.job_result, .job-result-card, [data-testid="job-result"], .job_result, article',
    title: '.job_title, h2 a, a.job_title, h2, h3',
    company: '.job_org_name, .company, .org, .job_org, [class*="company"]',
    location: '.job_location, .location, [class*="location"]',
    link: 'a.job_title, h2 a, a[href*="job"]',
    snippet: '.job_snippet, .snippet, .job_description, p'
  };
  return scrapeWithPlaywright('ZipRecruiter', url, selectors, searchConfig, { headless: false });
}

async function scrapeNaukri(searchConfig) {
  const keywords = (searchConfig.keywords || ['data analyst']).join(' ');
  const location = searchConfig.location || 'Bangalore';
  const url = `https://www.naukri.com/${encodeURIComponent(keywords.replace(/\s+/g, '-'))}-jobs-in-${encodeURIComponent(location.split(',')[0].trim().toLowerCase())}`;
  const selectors = {
    card: 'article.jobTuple, div.srp-jobtuple-wrapper, div.cust-job-tuple, .jobTuple, [data-job-id], article',
    title: 'a.title, a.job-title, .title',
    company: '.comp-name, a.subTitle, .company-name',
    location: '.locWdth, span.loc, .location',
    link: 'a.title, a.job-title, a[href*="job"]',
    snippet: '.job-desc, .jobDescription, .row'
  };
  return scrapeWithPlaywright('Naukri', url, selectors, searchConfig, { headless: false });
}

async function scrapeInstahyre(searchConfig) {
  const keywords = (searchConfig.keywords || ['data analyst']).join(' ');
  const url = `https://www.instahyre.com/search-jobs?skills=${encodeURIComponent(keywords)}`;
  const selectors = {
    card: '.job-card, .job-profile-card, .employer-row, [data-job-id], .card',
    title: '.job-title, h2, h3, .title',
    company: '.company-name, .company',
    location: '.location',
    link: '.job-title a, a.job-title, a[href*="job"]',
    snippet: '.job_description, .job-desc, .description'
  };
  return scrapeWithPlaywright('Instahyre', url, selectors, searchConfig);
}

async function scrapeAcciojob(searchConfig) {
  const url = `https://acciojob.com/jobs`;
  const selectors = {
    card: '.job-card, .job-listing, .card, [class*="job"]',
    title: '.job-title, .title, h3, h2',
    company: '.company-name, .company',
    location: '.job-location, .location',
    link: 'a',
    snippet: '.description, p'
  };
  return scrapeWithPlaywright('Acciojob', url, selectors, searchConfig);
}

// ═══════════════════════════════════════════════════════════════
// LEVER / GREENHOUSE COMPANY BOARD MONITOR
// ═══════════════════════════════════════════════════════════════

async function scrapeLeverBoard(boardUrl) {
  const jobs = [];
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const results = await page.evaluate(() => {
      const postings = document.querySelectorAll('.posting');
      return Array.from(postings).map(p => ({
        title: p.querySelector('.posting-title h5')?.textContent?.trim() || '',
        location: p.querySelector('.posting-categories .location')?.textContent?.trim() || '',
        team: p.querySelector('.posting-categories .department')?.textContent?.trim() || '',
        href: p.querySelector('a.posting-title')?.getAttribute('href') || ''
      })).filter(j => j.title && j.href);
    });

    const company = boardUrl.split('/').filter(Boolean).pop() || 'Unknown';
    for (const r of results) {
      jobs.push({
        title: r.title,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        location: r.location || '',
        description: r.team || '',
        url: r.href.startsWith('http') ? r.href : `${boardUrl.replace(/\/$/, '')}/${r.href.replace(/^\//, '')}`,
        source: 'Lever Board',
        discoveredAt: new Date().toISOString()
      });
    }

    await browser.close();
  } catch (err) {
    console.error(`[Discovery:Lever] Board scrape failed for ${boardUrl}:`, err.message);
    if (browser) await browser.close().catch(() => {});
  }

  return jobs;
}

async function scrapeGreenhouseBoard(boardUrl) {
  const jobs = [];
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const results = await page.evaluate(() => {
      const rows = document.querySelectorAll('.opening, tr.job-post, [data-mapped]');
      return Array.from(rows).map(r => ({
        title: r.querySelector('a')?.textContent?.trim() || '',
        location: r.querySelector('.location, td:nth-child(2)')?.textContent?.trim() || '',
        href: r.querySelector('a')?.getAttribute('href') || ''
      })).filter(j => j.title && j.href);
    });

    const company = boardUrl.match(/greenhouse\.io\/([^/?]+)/)?.[1] || 'Unknown';
    for (const r of results) {
      const fullUrl = r.href.startsWith('http') ? r.href : `https://boards.greenhouse.io${r.href}`;
      jobs.push({
        title: r.title,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        location: r.location || '',
        description: '',
        url: fullUrl,
        source: 'Greenhouse Board',
        discoveredAt: new Date().toISOString()
      });
    }

    await browser.close();
  } catch (err) {
    console.error(`[Discovery:Greenhouse] Board scrape failed for ${boardUrl}:`, err.message);
    if (browser) await browser.close().catch(() => {});
  }

  return jobs;
}

// ═══════════════════════════════════════════════════════════════
// FULL JD FETCHER — Get complete description for a discovered job
// ═══════════════════════════════════════════════════════════════

export async function fetchFullDescription(jobUrl) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const description = await page.evaluate(() => {
      // Try common JD container selectors
      const selectors = [
        '.job-description', '.jobsearch-jobDescriptionText',
        '#job-details', '.description__text', '.posting-page',
        '.content', '[data-testid="job-description"]',
        'article', '.job_description', '.details',
        '#content', '.job-detail', 'main'
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim().length > 100) {
          return el.textContent.trim().substring(0, 3000);
        }
      }

      // Fallback: grab body text
      return document.body?.textContent?.trim()?.substring(0, 3000) || '';
    });

    await browser.close();
    return description;
  } catch (err) {
    console.error(`[Discovery] Failed to fetch full JD from ${jobUrl}:`, err.message);
    if (browser) await browser.close().catch(() => {});
    return '';
  }
}

// ═══════════════════════════════════════════════════════════════
// DEDUPLICATION
// ═══════════════════════════════════════════════════════════════

function deduplicateJobs(newJobs, existingApps) {
  const existingUrls = new Set(existingApps.map(a => normalizeUrl(a.url)));
  const existingTitles = new Set(existingApps.map(a => `${a.title}|||${a.company}`.toLowerCase()));
  const seen = new Set();

  return newJobs.filter(job => {
    const normUrl = normalizeUrl(job.url);
    const titleKey = `${job.title}|||${job.company}`.toLowerCase();

    // Skip if we've seen this URL or title+company combo
    if (existingUrls.has(normUrl) || existingTitles.has(titleKey) || seen.has(normUrl) || seen.has(titleKey)) {
      return false;
    }

    seen.add(normUrl);
    seen.add(titleKey);
    return true;
  });
}

function normalizeUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/$/, '');
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN DISCOVERY ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Runs a full discovery scan across all configured sources.
 * Deduplicates, scores, and stores new matches.
 * 
 * @param {object} searchConfig - { keywords, location, sources, minScore, companyBoards }
 * @returns {{ newJobs: number, totalScanned: number, highMatches: number }}
 */
export async function runDiscovery(searchConfig) {
  console.log('═══════════════════════════════════════');
  console.log('[Discovery] Starting scan...');
  console.log(`  Keywords: ${searchConfig.keywords?.join(', ')}`);
  console.log(`  Location: ${searchConfig.location}`);
  console.log(`  Sources:  ${searchConfig.sources?.join(', ')}`);
  console.log('═══════════════════════════════════════');

  const originalSources = searchConfig.sources || ['indeed', 'remoteok', 'weworkremotely', 'ziprecruiter', 'naukri', 'instahyre', 'acciojob'];
  const sources = originalSources.map(s => s.toLowerCase());
  const allJobs = [];

  // Run enabled scrapers sequentially to prevent CPU overload and browser profile locks
  if (sources.some(s => s.includes('indeed'))) {
    try {
      const batch = await scrapeIndeed(searchConfig);
      allJobs.push(...batch);
    } catch (e) {
      console.error('[Indeed error]', e.message);
    }
  }
  if (sources.some(s => s.includes('linkedin'))) {
    try {
      const batch = await scrapeLinkedIn(searchConfig);
      allJobs.push(...batch);
    } catch (e) {
      console.error('[LinkedIn error]', e.message);
    }
  }
  if (sources.some(s => s.includes('weworkremotely'))) {
    try {
      const batch = await scrapeWWR(searchConfig);
      allJobs.push(...batch);
    } catch (e) {
      console.error('[WeWorkRemotely error]', e.message);
    }
  }
  if (sources.some(s => s.includes('remoteok'))) {
    try {
      const batch = await scrapeRemoteOK(searchConfig);
      allJobs.push(...batch);
    } catch (e) {
      console.error('[RemoteOK error]', e.message);
    }
  }
  if (sources.some(s => s.includes('ziprecruiter'))) {
    try {
      const batch = await scrapeZipRecruiter(searchConfig);
      allJobs.push(...batch);
    } catch (e) {
      console.error('[ZipRecruiter error]', e.message);
    }
  }
  if (sources.some(s => s.includes('naukri'))) {
    try {
      const batch = await scrapeNaukri(searchConfig);
      allJobs.push(...batch);
    } catch (e) {
      console.error('[Naukri error]', e.message);
    }
  }
  if (sources.some(s => s.includes('instahyre'))) {
    try {
      const batch = await scrapeInstahyre(searchConfig);
      allJobs.push(...batch);
    } catch (e) {
      console.error('[Instahyre error]', e.message);
    }
  }
  if (sources.some(s => s.includes('acciojob'))) {
    try {
      const batch = await scrapeAcciojob(searchConfig);
      allJobs.push(...batch);
    } catch (e) {
      console.error('[Acciojob error]', e.message);
    }
  }

  // Company board monitors
  const boards = searchConfig.companyBoards || [];
  for (const boardUrl of boards) {
    try {
      if (boardUrl.includes('lever.co')) {
        const batch = await scrapeLeverBoard(boardUrl);
        allJobs.push(...batch);
      } else if (boardUrl.includes('greenhouse.io')) {
        const batch = await scrapeGreenhouseBoard(boardUrl);
        allJobs.push(...batch);
      }
    } catch (e) {
      console.error(`[Company board error for ${boardUrl}]`, e.message);
    }
  }

  console.log(`[Discovery] Total scraped: ${allJobs.length} jobs`);

  // Deduplicate against existing applications
  const existing = getApplications();
  const newJobs = deduplicateJobs(allJobs, existing);
  console.log(`[Discovery] After dedup: ${newJobs.length} new jobs`);

  // Score and filter
  const minScore = searchConfig.minScore || 40;
  let highMatches = 0;
  const savedJobs = [];

  for (const job of newJobs) {
    // Quick relevance pre-filter
    if (!isRelevantJob(job.title, job.description, searchConfig)) continue;

    // If description is too short, try fetching full JD
    let description = job.description;
    if (description.length < 80 && job.url) {
      try {
        const fullDesc = await fetchFullDescription(job.url);
        if (fullDesc.length > description.length) {
          description = fullDesc;
        }
      } catch {
        // Use what we have
      }
    }

    // Score the job
    const match = computeMatchScore(description, job.title);

    if (match.score >= minScore) {
      const savedApp = addApplication({
        title: job.title,
        company: job.company,
        url: job.url,
        description: description.substring(0, 2000),
        notes: `Auto-discovered from ${job.source} on ${new Date().toLocaleDateString()}`,
        status: 'discovered',
        matchScore: match.score,
        matchAnalysis: match.details,
        matchingSkills: match.matchingSkills,
        missingSkills: match.missingSkills,
        source: job.source
      });

      savedJobs.push(savedApp);
      if (match.score >= 70) highMatches++;
      console.log(`  ✅ [${match.score}%] ${job.title} @ ${job.company} (${job.source})`);
    }
  }

  const summary = {
    totalScanned: allJobs.length,
    newAfterDedup: newJobs.length,
    savedJobs: savedJobs.length,
    highMatches,
    timestamp: new Date().toISOString()
  };

  console.log('═══════════════════════════════════════');
  console.log(`[Discovery] Complete! Saved ${savedJobs.length} jobs (${highMatches} high matches)`);
  console.log('═══════════════════════════════════════');

  return summary;
}
