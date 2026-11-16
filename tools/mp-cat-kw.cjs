const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  for (const name of ['Security and compliance', 'Project management']) {
    const cat = page.locator('#react-select-5-input').first();
    await cat.click({ force: true });
    await page.waitForTimeout(1800);
    const opt = page.locator('[role=option]').filter({ hasText: new RegExp('^' + name) }).first();
    if (await opt.count()) { await opt.click({ force: true }); console.log('选分类:', name); }
    await page.waitForTimeout(1200);
  }

  // keywords
  const kw = page.locator('input[name*=keyword i], input[id*=keyword i]').first();
  if (await kw.count()) { await kw.fill('approval, approval tracking, compliance, audit, confluence, sign-off, approval drift'); await kw.press('Tab'); console.log('keywords ok'); }
  else console.log('keyword 字段未找到');

  // personal data = No
  const no = page.locator('input[name=storesPersonalData][value=No]').first();
  if (await no.count()) { await no.check({ force: true }); console.log('personal data = No'); }

  await page.waitForTimeout(1500);
  const vals = await page.$$eval('input:not([type=hidden]), textarea', els => els.filter(e => e.offsetWidth||e.offsetHeight).map(e => ({ name: e.name||e.id, val: (e.value||'').slice(0,30), checked: e.checked })).filter(x => x.name));
  console.log('当前字段:', JSON.stringify(vals).slice(0, 700));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
