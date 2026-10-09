const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('Page Error:', err.message);
  });
  
  page.on('error', err => {
    console.error('Crash Error:', err.message);
  });

  console.log("Navigating to demo gift...");
  try {
    const response = await page.goto('https://lovelink-app-beta.vercel.app/gift/demo-gift', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log("Status Code:", response.status());
    
    // Check for any specific crash text
    const content = await page.content();
    if (content.includes("This page couldn't load")) {
      console.log("FOUND CRASH TEXT IN DOM");
    } else {
      console.log("Page loaded successfully.");
    }
  } catch (e) {
    console.error("Navigation failed:", e.message);
  }

  await browser.close();
})();
