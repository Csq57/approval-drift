const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  console.log('URL:', page.url());
  const info = await page.evaluate(() => {
    const roots = [];
    const walk = (root, d) => {
      if (d > 25 || roots.length > 200) return;
      const els = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (const el of els) { if (el.shadowRoot) { roots.push(el.tagName); walk(el.shadowRoot, d + 1); } }
    };
    walk(document, 0);
    const bodyText = (document.body.innerText || '').replace(/\s+/g, ' ');
    return { shadowHosts: roots.length, hasAgent: /Approval drift auditor/.test(bodyText), text: bodyText.slice(0, 300) };
  });
  console.log(JSON.stringify(info, null, 1).slice(0, 800));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
