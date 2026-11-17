const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const btns = await page.$$eval('button', els => els.map(e => (e.textContent||'').trim()).filter(x => x && x.length < 20));
  console.log('按钮:', JSON.stringify([...new Set(btns)].slice(0, 12)));

  const save = page.getByRole('button', { name: /^Save$/ }).first();
  if (await save.count()) { await save.click({ force: true }); console.log('已保存'); await page.waitForTimeout(8000); }
  else console.log('没有 Save 按钮');

  const resub = page.getByRole('button', { name: /^Resubmit$/ }).first();
  console.log('Resubmit 存在:', await resub.count());
  if (await resub.count()) { await resub.click({ force: true }); console.log('已点 Resubmit'); await page.waitForTimeout(12000); }

  const m = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', m.replace(/\n{2,}/g,' | ').slice(0, 400));
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 4)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
