const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(el => {
      const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      if (own === 'Confluence') {
        let n = el, path = [];
        for (let i = 0; i < 5 && n; i++) { path.push(n.tagName + (n.getAttribute('role') ? '[' + n.getAttribute('role') + ']' : '') + (n.className ? '.' + String(n.className).split(' ')[0].slice(0, 18) : '')); n = n.parentElement; }
        out.push(path.join(' < '));
      }
    });
    return out.slice(0, 3);
  });
  console.log('结构:', JSON.stringify(info, null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
