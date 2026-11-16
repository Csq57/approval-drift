const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  const cookie = page.getByRole('button', { name: /接受全部|Accept all/i }).first();
  if (await cookie.count()) { await cookie.click({ force: true }).catch(()=>{}); await page.waitForTimeout(1500); }

  const next = page.getByRole('button', { name: /Next: Make public/i }).first();
  console.log('Next: Make public =', await next.count());
  await next.click({ force: true });
  await page.waitForTimeout(6000);

  console.log('URL:', page.url().slice(0, 100));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('BODY:', t.slice(0, 700));
  const controls = await page.$$eval('select, input, button', els => els.map(e => ({
    tag: e.tagName.toLowerCase(), id: e.id||'', name: e.name||'',
    txt: (e.tagName==='SELECT'||e.tagName==='BUTTON') ? (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40) : '',
  })).filter(x => x.id || x.name || x.txt).slice(0, 24));
  console.log('CONTROLS:', JSON.stringify(controls).slice(0, 1200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
