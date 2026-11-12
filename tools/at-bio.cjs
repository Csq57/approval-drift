const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.airtasker.com/account/portfolio/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  const areas = await page.$$eval('textarea, [contenteditable=true]', els => els.map(e => ({
    tag: e.tagName.toLowerCase(), id: e.id, ph: e.placeholder || '', len: (e.value || e.textContent || '').length,
    val: (e.value || e.textContent || '').slice(0, 900),
  })));
  for (const a of areas) {
    if (a.len > 60) { console.log('---', a.tag, a.id, a.ph, 'len', a.len); console.log(a.val); }
  }
  console.log('COUNT', areas.length, JSON.stringify(areas.map(a => [a.tag, a.id, a.len])));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
