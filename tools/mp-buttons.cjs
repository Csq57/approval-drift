const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);
  const all = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('button, a[role=button], input[type=submit]').forEach(e => {
      const t = (e.textContent || e.value || '').trim();
      if (t && t.length < 30) out.push({ t, tag: e.tagName, vis: !!(e.offsetWidth || e.offsetHeight), dis: e.disabled });
    });
    return out;
  });
  console.log('页面底部按钮:', JSON.stringify(all.slice(-12), null, 1).slice(0, 900));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
