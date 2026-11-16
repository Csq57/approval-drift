const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer-space')) || context.pages()[0];
  await page.waitForTimeout(2000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = t.indexOf('Billing account');
  console.log('BILLING CTX:', i > -1 ? t.slice(i, i + 300) : 'n/a');
  const btns = await page.$$eval('button, a[role=button], ytcp-button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 32));
  console.log('BUTTONS:', JSON.stringify([...new Set(btns)]));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
