const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/apps/1264724096/privacy-and-security', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);
  console.log('URL:', page.url().slice(0, 110));
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', m.replace(/\n{2,}/g, '\n').slice(0, 1400));
  const missing = await page.$$eval('[class*=error], [aria-invalid=true]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,5));
  console.log('错误标记:', JSON.stringify(missing));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
