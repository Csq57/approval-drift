const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(1500);
  const groups = await page.evaluate(() => {
    const out = [];
    const seen = new Set();
    document.querySelectorAll('input[type=radio]').forEach(r => {
      if (seen.has(r.name)) return;
      seen.add(r.name);
      let cont = r.closest('fieldset, div');
      let q = '';
      for (let i = 0; i < 4 && cont; i++) { const t = (cont.textContent||'').replace(/\s+/g,' ').trim(); if (t.length > 20) { q = t.slice(0, 110); break; } cont = cont.parentElement; }
      const opts = [...document.querySelectorAll(`input[name="${r.name}"]`)].map(x => x.value);
      out.push({ name: r.name, q, opts, answered: [...document.querySelectorAll(`input[name="${r.name}"]`)].some(x => x.checked) });
    });
    return out;
  });
  groups.forEach((g,i) => console.log(i, '|', g.name, '| opts:', JSON.stringify(g.opts), '| answered:', g.answered, '|', g.q.slice(0, 90)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
