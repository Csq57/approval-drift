const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const all = context.pages();
  console.log('PAGES:', all.map(p => p.url().slice(0, 60)).join(' || '));
  const page = all.find(p => p.url().includes('one-atlas-csnw')) || all[0];
  console.log('USING:', page.url().slice(0, 80));

  const t = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));
  console.log('MAIN TEXT len:', t.length, '| has agent:', /Approval drift auditor/i.test(t));
  const withShadow = await page.evaluate(() => {
    const out = [];
    const grab = (root, d) => {
      if (d > 30) return;
      if (root.textContent) out.push(root.textContent);
      try { root.querySelectorAll('*').forEach(el => { if (el.shadowRoot) grab(el.shadowRoot, d + 1); }); } catch (e) {}
    };
    grab(document, 0);
    return out.join(' ').replace(/\s+/g, ' ');
  });
  console.log('SHADOW TEXT len:', withShadow.length, '| has agent:', /Approval drift auditor/i.test(withShadow));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
