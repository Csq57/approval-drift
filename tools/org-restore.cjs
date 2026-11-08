const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('admin.atlassian.com') || p.url() === 'about:blank') || context.pages()[0];
  await page.goto('https://admin.atlassian.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);

  // pick the old org
  const old = page.getByText('chensongquan0814', { exact: false }).first();
  if (await old.count()) { await old.click({ force: true }).catch(()=>{}); await page.waitForTimeout(6000); }
  console.log('URL:', page.url().slice(0, 90));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('TEXT:', t.slice(0, 600));
  const acts = await page.$$eval('button,a', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => /restore|恢复|删除|delete|suspend|停用|active|激活/i.test(x)).slice(0, 10));
  console.log('RESTORE-ish:', JSON.stringify(acts));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
