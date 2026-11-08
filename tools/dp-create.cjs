const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  await page.getByRole('button', { name: /Create project/i }).first().click().catch(async () => {
    await page.getByText('Create project', { exact: false }).first().click();
  });
  await page.waitForTimeout(6000);
  console.log('URL:', page.url());
  const inputs = await page.$$eval('input,textarea,select', els => els.map(e => ({
    tag: e.tagName, type: e.type, name: e.name, id: e.id,
    ph: e.placeholder || '', label: (e.labels && e.labels[0] && e.labels[0].textContent.trim()) || ''
  })).slice(0, 20));
  console.log(JSON.stringify(inputs, null, 1).slice(0, 1500));
  await page.screenshot({ path: 'shots/dp-2.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
