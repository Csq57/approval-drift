const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--incognito'] });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  await page.goto('https://id.atlassian.com/signup', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);
  console.log('URL:', page.url());
  const fields = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, id: e.id })));
  console.log('FIELDS:', JSON.stringify(fields));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('CAPTCHA?', /captcha|我不是机器人|verify you are human/i.test(t));
  console.log('TEXT:', t.slice(0, 300));
  // keep the browser open for the next step
  await page.waitForTimeout(1000);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
