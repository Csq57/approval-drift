const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const u of ['/account/profile/', '/account/edit/']) {
    await page.goto('https://www.airtasker.com' + u, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    const fields = await page.$$eval('input, textarea, [contenteditable=true]', els =>
      els.map(e => ({
        tag: e.tagName.toLowerCase(),
        type: e.type || '',
        name: e.name || '',
        id: e.id || '',
        ph: (e.placeholder || '').slice(0, 40),
        label: (e.labels && e.labels[0] ? e.labels[0].textContent : '').replace(/\s+/g, ' ').trim().slice(0, 40),
        val: (e.value || '').slice(0, 60),
      })).filter(f => f.tag === 'textarea' || f.type === 'text' || f.ph || f.label || f.id));
    console.log('=== ' + u + ' ===');
    console.log(JSON.stringify(fields, null, 0).slice(0, 1400));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
