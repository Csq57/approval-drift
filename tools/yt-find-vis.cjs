const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('bpcKyQ9qhKE')) || context.pages()[0];
  await page.waitForTimeout(3000);
  const found = await page.evaluate(() => {
    const hits = [];
    const walk = (root) => {
      root.querySelectorAll('*').forEach(el => {
        const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
        if (/^Visibility$/i.test(own)) hits.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,40) });
      });
    };
    walk(document);
    const pubs = [];
    document.querySelectorAll('*').forEach(el => {
      const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      if (/^Public$/i.test(own)) pubs.push(el.tagName);
    });
    return { visibility: hits.slice(0, 4), publicNodes: pubs.slice(0, 4) };
  });
  console.log(JSON.stringify(found));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
