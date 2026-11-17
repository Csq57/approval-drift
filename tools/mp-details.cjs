const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.goto('https://marketplace.atlassian.com/manage/apps/1264724096/details', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('DETAILS PAGE:', m.replace(/\n{2,}/g,' | ').slice(0, 900));
  const btns = await page.$$eval('button, a', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 45 && /public|private|review|submit|visibility|status/i.test(x)));
  console.log('相关操作:', JSON.stringify([...new Set(btns)].slice(0, 10)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
