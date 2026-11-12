const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('https://www.airtasker.com/account/skills/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);

  for (const tab of ['Specialties', 'Work']) {
    const t = page.getByRole('tab', { name: tab }).first();
    if (await t.count()) await t.click({ force: true });
    else await page.getByText(tab, { exact: true }).first().click({ force: true }).catch(()=>{});
    await page.waitForTimeout(2500);
    const rows = await page.$$eval('input[type=checkbox]', els => els.map(e => {
      let n = e.parentElement, txt = '';
      for (let i = 0; i < 4 && n; i++) { const s = (n.textContent||'').replace(/\s+/g,' ').trim(); if (s && s.length < 45) { txt = s; break; } n = n.parentElement; }
      return { on: e.checked, txt };
    }));
    console.log('=== ' + tab + ' (' + rows.length + ')');
    console.log(rows.map(r => (r.on ? '[x] ' : '[ ] ') + r.txt).join(' | ').slice(0, 900));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
