const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google/.test(p.url())) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('https://admin.atlassian.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  console.log('URL:', page.url());
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('TEXT:', t.slice(0, 600));
  const btns = await page.$$eval('a,button', els => els.map(e => (e.textContent || '').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 40).slice(0, 20));
  console.log('ACTIONS:', JSON.stringify(btns));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
