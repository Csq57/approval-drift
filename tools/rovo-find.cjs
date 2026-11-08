const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());

  const found = await page.evaluate(() => {
    const hits = [];
    const walk = (root, d) => {
      if (d > 30 || hits.length > 50) return;
      const els = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (const el of els) {
        const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
        if (own && /Approval drift auditor/i.test(own)) hits.push(el.tagName + '|' + own.slice(0, 60));
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document, 0);
    return hits;
  }).catch(e => ['ERR ' + e.message]);
  console.log('NODES:', JSON.stringify(found).slice(0, 500));

  const panelText = await page.evaluate(() => {
    const grab = (root, d, out) => {
      if (d > 30) return out;
      if (root.textContent) out.push(root.textContent);
      root.querySelectorAll && root.querySelectorAll('*').forEach(el => { if (el.shadowRoot) grab(el.shadowRoot, d + 1, out); });
      return out;
    };
    return grab(document, 0, []).join(' ').replace(/\s+/g, ' ');
  }).catch(() => '');
  console.log('HAS_AGENT_IN_SHADOW:', /Approval drift auditor/i.test(panelText));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
