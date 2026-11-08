const { chromium } = require('playwright');
const PROFILE = process.env.TEMP + '\\atlassian-test-profile';
(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome', headless: false, viewport: { width: 1200, height: 900 },
    args: ['--no-first-run', '--no-default-browser-check'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://id.atlassian.com/signup', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  await page.locator('#email-_r0_').fill('0814chensongquan+forge@gmail.com').catch(async () => {
    await page.locator('input[type=email]').first().fill('0814chensongquan+forge@gmail.com');
  });
  await page.getByRole('button', { name: /注册|Sign up|Next|继续/i }).first().click({ force: true }).catch(()=>{});
  await page.waitForTimeout(8000);
  console.log('URL:', page.url().slice(0, 90));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('CAPTCHA?', /captcha|不是机器人|verify you are human|人机/i.test(t));
  console.log('TEXT:', t.slice(0, 400));
  const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder||'' })));
  console.log('FIELDS:', JSON.stringify(inputs));
  await ctx.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
