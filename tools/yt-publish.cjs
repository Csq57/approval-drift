const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.waitForTimeout(2000);

  const pub = page.locator('tp-yt-paper-radio-button', { hasText: /^Public$/ }).first();
  console.log('public radio:', await pub.count());
  if (await pub.count()) { await pub.click({ force: true }); await page.waitForTimeout(2500); }

  const btns = await page.$$eval('ytcp-button, button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 20));
  console.log('buttons now:', JSON.stringify([...new Set(btns)].slice(0, 14)));

  const done = page.getByRole('button', { name: /^(Publish|Save|Done)$/ }).first();
  if (await done.count()) {
    await done.click({ force: true });
    await page.waitForTimeout(12000);
    console.log('clicked publish');
  } else console.log('no publish button');

  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const m = t.match(/youtu\.be\/[\w-]+/);
  console.log('LINK:', m ? m[0] : 'n/a');
  console.log('STATE:', t.slice(0, 200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
