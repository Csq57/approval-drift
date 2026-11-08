const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.getByRole('button', { name: '跳过' }).click().catch(() => {});
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: /Start project/i }).first().click().catch(async () => {
    await page.getByRole('button', { name: /Create project/i }).first().click();
  });
  await page.waitForTimeout(7000);
  console.log('URL:', page.url());

  const fields = await page.$$eval('input:not([type=hidden]),textarea,select', els => els.map(e => ({
    tag: e.tagName, type: e.type, name: e.name, id: e.id,
    ph: (e.placeholder || '').slice(0, 40),
    label: (e.labels && e.labels[0] ? e.labels[0].textContent : '').replace(/\s+/g, ' ').trim().slice(0, 50)
  })).filter(f => f.type !== 'file'));
  console.log(JSON.stringify(fields, null, 1).slice(0, 2000));
  await page.screenshot({ path: 'shots/dp-3.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
