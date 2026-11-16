const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(800);
  const missing = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable=true]').forEach(el => {
      if (!(el.offsetWidth || el.offsetHeight)) return;
      const val = (el.value !== undefined ? el.value : el.innerText) || '';
      if (val.trim()) return;
      // find nearby label text
      let lab = '';
      const cont = el.closest('div');
      if (cont) lab = (cont.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      out.push({ id: el.id || el.name || el.tagName, lab });
    });
    return out;
  });
  console.log('空字段:', JSON.stringify(missing.slice(0, 8), null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
