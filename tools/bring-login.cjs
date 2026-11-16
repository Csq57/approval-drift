const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('id.atlassian.com') || p.url() === 'about:blank') || pages[0];
  await page.setViewportSize({ width: 1400, height: 950 });
  await page.goto('https://id.atlassian.com/login?continue=https%3A%2F%2Fdeveloper.atlassian.com%2Fconsole%2Fmyapps%2F', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.bringToFront();
  await page.waitForTimeout(3000);
  console.log('已把登录页置前:', page.url().slice(0, 80));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
