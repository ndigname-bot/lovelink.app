const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.goto('https://lovelink-app-beta.vercel.app', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'public/screenshot.png' });
  await browser.close();
})();
