const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(800);

  const res = await page.evaluate(() => {
    const hits = [];
    document.querySelectorAll('*').forEach(el => {
      const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      if (own === 'Administrative tools') hits.push(el.tagName);
    });
    if (!hits.length) return 'not found';
    // find the remove control inside the same chip
    const node = [...document.querySelectorAll('*')].find(el => {
      const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      return own === 'Administrative tools';
    });
    let p = node;
    for (let i = 0; i < 3 && p; i++) {
      const btn = p.querySelector('[aria-label*="Remove" i], svg, [role=button]');
      if (btn) { btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'clicked:' + btn.tagName; }
      p = p.parentElement;
    }
    return 'no remove control';
  });
  console.log('删除结果:', res);
  await page.waitForTimeout(2500);

  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0,3)));

  await page.getByRole('button', { name: /^Next$/ }).first().click({ force: true });
  await page.waitForTimeout(9000);
  const client = await context.newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots/mp-pd4.png', Buffer.from(data, 'base64'));
  console.log('saved');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
