const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(1200);
  const data = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('input[type=radio]').forEach(r => {
      const lab = (r.closest('label') || r.parentElement || {}).textContent || '';
      out.push({ name: r.name, text: lab.replace(/\s+/g, ' ').trim().slice(0, 70) });
    });
    const grouped = {};
    out.forEach(o => { (grouped[o.name] = grouped[o.name] || []).push(o.text); });
    return grouped;
  });
  Object.entries(data).forEach(([k, v]) => console.log(k.split('.').pop(), '->', JSON.stringify(v)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
