const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('https://www.airtasker.com/messages/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  const target = page.getByText(/Help with a simple Excel spreadsheet/i).first();
  console.log('found thread title:', await target.count());
  await target.click({ force: true }).catch(async () => {
    await page.getByText('Rajesh K.', { exact: false }).first().click({ force: true });
  });
  await page.waitForTimeout(5000);
  console.log('URL now:', page.url().slice(0, 80));

  const composers = await page.$$eval('textarea, [contenteditable=true], input[type=text]', els => els.map(e => ({
    tag: e.tagName.toLowerCase(), id: e.id, ph: (e.placeholder||'').slice(0,40),
    cls: (e.className||'').toString().slice(0,40),
  })));
  console.log('COMPOSERS:', JSON.stringify(composers).slice(0, 600));
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('TAIL:', body.slice(-400));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
