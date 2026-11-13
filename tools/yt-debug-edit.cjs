const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com')) || context.pages()[0];
  await page.bringToFront();
  const info = await page.evaluate(() => {
    const out = [];
    const walk = (root, depth) => {
      if (depth > 30) return;
      root.querySelectorAll('*').forEach(el => {
        const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
        if (/Edit draft/i.test(own)) out.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,30), own: own.slice(0,20) });
        if (el.shadowRoot) walk(el.shadowRoot, depth + 1);
      });
    };
    walk(document, 0);
    return { matches: out.slice(0, 6), hasShadow: !!document.querySelector('ytcp-app') };
  });
  console.log(JSON.stringify(info));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
