const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer-space')) || context.pages()[0];
  await page.waitForTimeout(1500);

  const btn = page.getByRole('button', { name: /Review & publish/i }).first();
  console.log('button:', await btn.count());
  await btn.click({ force: true });
  await page.waitForTimeout(5000);

  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = t.indexOf('Marketplace Partner Agreement');
  console.log('MODAL CTX:', i > -1 ? t.slice(Math.max(0, i - 420), i + 420) : t.slice(0, 600));
  const btns = await page.$$eval('button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 30));
  console.log('MODAL BUTTONS:', JSON.stringify([...new Set(btns)]));
  const checks = await page.$$eval('input[type=checkbox]', els => els.map(e => ({ checked: e.checked, id: e.id })));
  console.log('CHECKBOXES:', JSON.stringify(checks));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
