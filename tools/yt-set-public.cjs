const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log('pages:', pages.map(p => p.url().slice(0, 55)).join(' || '));
  const page = pages.find(p => p.url().includes('bpcKyQ9qhKE')) || pages[0];
  await page.waitForTimeout(12000);

  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = t.indexOf('Visibility');
  console.log('VIS:', i > -1 ? t.slice(i, i + 220) : 'not found');

  const pub = page.getByRole('radio', { name: /^Public$/ }).first();
  console.log('public radio:', await pub.count(), '| checked:', await pub.count() ? await pub.isChecked().catch(() => '?') : 'n/a');
  if (await pub.count() && !(await pub.isChecked())) {
    await pub.click({ force: true });
    await page.waitForTimeout(2500);
    const save = page.getByRole('button', { name: /^Save$/ }).first();
    console.log('save btn:', await save.count());
    if (await save.count()) { await save.click({ force: true }); await page.waitForTimeout(8000); }
    console.log('clicked public + save');
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
