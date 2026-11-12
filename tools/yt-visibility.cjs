const { chromium } = require('playwright');
const VID = 'bpcKyQ9qhKE';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto(`https://studio.youtube.com/video/${VID}/edit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);

  const title = await page.locator('#textbox').first().textContent().catch(() => '');
  console.log('TITLE NOW:', (title || '').trim().slice(0, 60));

  // visibility section
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = t.indexOf('Visibility');
  console.log('VIS SNIP:', t.slice(i, i + 200));

  const pub = page.getByRole('radio', { name: /^Public$/ }).first();
  console.log('public radio count:', await pub.count());
  if (await pub.count()) {
    await pub.click({ force: true });
    await page.waitForTimeout(2000);
    const save = page.getByRole('button', { name: /^Save$/ }).first();
    if (await save.count()) { await save.click({ force: true }); await page.waitForTimeout(6000); console.log('saved'); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
