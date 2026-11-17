const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.waitForTimeout(1200);
  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('textarea').forEach(t => {
      let lab = '';
      const cont = t.closest('div, fieldset, section');
      if (cont) lab = (cont.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90);
      out.push({ id: t.id, len: (t.value||'').length, lab });
    });
    return out;
  });
  info.forEach(i => console.log(i.id.replace('participants_submission_requirements_submission_field_values_attributes_','f'), '| len', i.len, '|', i.lab));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
