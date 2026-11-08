const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google|atlassian\.com\/try/.test(p.url())) || context.pages()[0];
  await page.goto('https://admin.atlassian.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  await page.getByRole('button', { name: /切换站点或应用|Switch site/ }).first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(3000);
  const items = await page.$$eval('[role=menuitem], [role=option], a, button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 50).slice(0, 30));
  console.log('MENU:', JSON.stringify(items));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const i = t.indexOf('创建');
  console.log('CREATE?', i > -1 ? t.slice(Math.max(0,i-120), i+200) : 'no 创建 found');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
