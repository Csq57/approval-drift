const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('id.atlassian.com/login/authorize')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(3000);
  console.log('URL:', page.url().slice(0, 110));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('BODY:', t.slice(0, 500));
  const btns = await page.$$eval('button, a[role=button], input[type=submit]', els => els.map(e => (e.textContent||e.value||'').replace(/\s+/g,' ').trim()).filter(x=>x && x.length<40));
  console.log('BUTTONS:', JSON.stringify([...new Set(btns)].slice(0, 12)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
