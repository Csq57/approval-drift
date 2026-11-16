const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('id.atlassian.com')) || pages[0];
  await page.bringToFront();
  await page.waitForTimeout(2000);

  const btn = page.getByRole('button', { name: /^Google$/i }).first();
  console.log('Google 按钮:', await btn.count());
  const popupPromise = context.waitForEvent('page', { timeout: 15000 }).catch(() => null);
  if (await btn.count()) await btn.click({ force: true });
  const popup = await popupPromise;
  await page.waitForTimeout(7000);

  const target = popup || page;
  console.log('当前页:', target.url().slice(0, 90));
  const t = ((await target.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('BODY:', t.slice(0, 260));
  const choices = await target.$$eval('[data-identifier], div[role=link], li', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 60).slice(0, 8)).catch(() => []);
  console.log('账号选项:', JSON.stringify(choices));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
