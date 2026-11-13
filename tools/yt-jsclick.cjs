const { chromium } = require('playwright');
const HELPERS = `
  window.__clickText = (re, tag) => {
    const hits = [];
    document.querySelectorAll(tag || 'button, ytcp-button, tp-yt-paper-radio-button, a, div[role=button]').forEach(el => {
      const t = (el.textContent || '').replace(/\\s+/g, ' ').trim();
      if (re.test(t) && t.length < 40) hits.push(el);
    });
    if (!hits.length) return 'none';
    const el = hits[hits.length - 1];
    const inner = el.querySelector('button') || el;
    ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(type => {
      inner.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    });
    return 'clicked:' + (el.textContent || '').trim().slice(0, 20);
  };
`;
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com')) || context.pages()[0];
  await page.bringToFront();
  await page.evaluate(HELPERS);
  console.log('url:', page.url().slice(0, 60));

  console.log('edit draft ->', await page.evaluate(() => window.__clickText(/Edit draft/i)));
  await page.waitForTimeout(9000);
  let t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('after edit draft:', t.slice(0, 200));

  console.log('visibility nav ->', await page.evaluate(() => window.__clickText(/^Visibility$/i)));
  await page.waitForTimeout(4000);
  const radios = await page.$$eval('tp-yt-paper-radio-button', els => els.map(e => (e.textContent||'').trim().slice(0,12)));
  console.log('radios:', JSON.stringify(radios));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
