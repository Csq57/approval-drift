const { chromium } = require('playwright');
const SPACE = 'b4bd9f6f-393a-469c-9a7d-ebb470c8c275';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer.atlassian.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 950 });

  await page.goto(`https://developer.atlassian.com/console/developer-space/${SPACE}/settings`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = t.indexOf('Make public on Marketplace');
  console.log('SPACE STATE:', i > -1 ? t.slice(i, i + 380) : 'section not found');
  console.log('PUBLISHED?', /is public|vendor profile|marketplace.atlassian.com\/vendors/i.test(t));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
