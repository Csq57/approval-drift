const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);
  const els = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a, button, [role=button]').forEach(e => {
      const t = (e.textContent || '').trim();
      if (/save|resubmit|submit/i.test(t) && t.length < 30) out.push({ tag: e.tagName, text: t, href: e.getAttribute('href') || '', cls: String(e.className).slice(0, 30) });
    });
    return out.slice(0, 10);
  });
  console.log('候选:', JSON.stringify(els, null, 1).slice(0, 900));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
