const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 900 });
  const targets = await page.evaluate(async () => {
    const r = await fetch('http://127.0.0.1:9222/json/list').catch(() => null);
    return r ? await r.json() : null;
  }).catch(() => null);
  console.log('targets:', targets ? targets.length : 'n/a');

  // deep text that pierces shadow roots
  const deep = await page.evaluate(() => {
    const out = [];
    const walk = (root, depth) => {
      if (depth > 40) return;
      const els = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (const el of els) {
        if (el.shadowRoot) walk(el.shadowRoot, depth + 1);
      }
      if (root.textContent) out.push(root.textContent.replace(/\s+/g, ' ').trim());
    };
    walk(document, 0);
    return out.join(' | ').slice(0, 2000);
  }).catch((e) => 'ERR ' + e.message);
  console.log('DEEP len:', deep.length);
  console.log('HAS_AGENT:', /Approval drift auditor/.test(deep));
  console.log('SNIP:', deep.slice(0, 400));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
