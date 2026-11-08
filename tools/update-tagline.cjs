const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google|try\/cloud/.test(p.url())) || context.pages()[0];
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const tag = page.locator('#software_tagline');
  console.log('old tagline:', JSON.stringify(await tag.inputValue()));
  await tag.fill('Approval drift for Confluence and Rovo: it notices the moment an approval stops matching the request it approved, and names the field that moved.');
  await page.locator('#software-save').click({ force: true });
  await page.waitForTimeout(8000);
  console.log('saved ->', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
