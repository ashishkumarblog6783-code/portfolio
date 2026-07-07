import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the resume page on the dev server
  await page.goto('http://localhost:5173/resume.html', {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Hide the print bar (no-print elements)
  await page.evaluate(() => {
    document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');
  });

  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');

  const outputPath = path.join(__dirname, 'public', 'Ashish_Kumar_Yadav_Resume.pdf');

  // Generate PDF - A4 size, no margins (the HTML already has proper padding)
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  console.log(`✅ PDF generated successfully: ${outputPath}`);
  
  await browser.close();
})();
