const { chromium } = require('playwright');
const LINK = process.env.AT_LINK;
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  const r = await page.goto(LINK, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(6000);
  console.log('HTTP:', r && r.status());
  console.log('FINAL URL:', page.url().slice(0, 120));
  console.log('LOGIN WALL:', /id\.atlassian\.com\/login/.test(page.url()));
  console.log('CONTINUE 保留安装地址:', /console%2Finstall%2Fcb87d8c6/.test(decodeURIComponent(page.url())));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
