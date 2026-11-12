const { chromium } = require('playwright');
const MSG = "Thanks Amanda — that's genuinely useful to know, and thanks for getting back to me rather than leaving it. All the best with everything. — Chan";
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('https://www.airtasker.com/messages/20620066/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  const box = page.locator('textarea[placeholder*="private message"]').first();
  await box.click({ force: true });
  await box.fill(MSG);
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: /^Send$/ }).first().click({ force: true });
  await page.waitForTimeout(5000);
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('SENT?', body.includes('genuinely useful to know'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
