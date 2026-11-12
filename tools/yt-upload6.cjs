const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.waitForTimeout(2000);

  const notKids = page.locator('tp-yt-paper-radio-button', { hasText: "No, it's not made for kids" }).first();
  console.log('notKids found:', await notKids.count());
  if (await notKids.count()) { await notKids.click({ force: true }); await page.waitForTimeout(2000); }

  for (let i = 0; i < 4; i++) {
    const next = page.getByRole('button', { name: /^Next$/ }).first();
    if (!(await next.count())) { console.log('no Next at', i); break; }
    await next.click({ force: true });
    await page.waitForTimeout(8000);
    const radios = await page.$$eval('tp-yt-paper-radio-button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,20)));
    console.log('after Next', i + 1, '-> radios:', JSON.stringify(radios));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
