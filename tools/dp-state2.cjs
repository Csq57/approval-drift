const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  console.log('URL:', page.url());
  const btns = await page.$$eval('button, input[type=submit], a.button', els => els.map(e => (e.textContent||e.value||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0, 15));
  console.log('BUTTONS:', JSON.stringify(btns));
  const boxes = await page.$$eval('input[type=checkbox]', els => els.map(e => ({ id: e.id, checked: e.checked, cls: e.className.slice(0,40), parent: (e.parentElement && e.parentElement.tagName) })));
  console.log('BOXES:', JSON.stringify(boxes));
  const body = (await page.textContent('body'))||'';
  console.log('HAS_ERRORS:', /error|required/i.test(body) ? 'maybe' : 'no');
  await page.screenshot({ path: 'shots/dp-state.png', fullPage: false });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
