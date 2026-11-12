const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const u of ['/account/tasker-dashboard/', '/account/profile/', '/account/skills/']) {
    await page.goto('https://www.airtasker.com' + u, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    const areas = await page.$$eval('textarea', els => els.map(e => ({
      id: e.id, ph: e.placeholder || '', val: (e.value || '').slice(0, 80),
      near: (e.closest('div')?.previousElementSibling?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      parentText: (e.parentElement?.parentElement?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    })));
    const heads = await page.$$eval('h1,h2,h3,label', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 45).slice(0, 14));
    console.log('=== ' + u);
    console.log(' textareas:', JSON.stringify(areas).slice(0, 700));
    console.log(' heads:', JSON.stringify(heads).slice(0, 500));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
