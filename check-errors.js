const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', error => {
    console.log(`BROWSER ERROR:`, error.message);
  });

  try {
    console.log('Navigating to http://localhost:38222 ...');
    await page.goto('http://localhost:38222', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Page loaded.');
    
    // Check if the error fallback is visible
    const errorText = await page.evaluate(() => document.body.innerText);
    if (errorText.includes('Page Error') || errorText.includes('Failed to load this page')) {
      console.log('Error boundary is visible on the page!');
    }
  } catch (err) {
    console.log('Navigation failed:', err.message);
  }

  await browser.close();
}

run();
