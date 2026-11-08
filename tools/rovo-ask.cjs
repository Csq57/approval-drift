const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForTimeout(1000);

  const frames = page.frames();
  console.log('frames:', frames.length);
  let target = page;
  for (const f of frames) {
    const txt = await f.textContent('body').catch(() => '');
    if (/Approval drift auditor/i.test(txt || '')) { target = f; console.log('agent in frame:', f.url().slice(0, 80)); break; }
  }
  const item = target.getByText('Approval drift auditor', { exact: false }).first();
  console.log('item count:', await target.getByText('Approval drift auditor', { exact: false }).count());
  if (await item.count()) {
    await item.click({ force: true }).catch(() => {});
    await page.waitForTimeout(3000);
    const box = target.getByRole('textbox').last();
    if (await box.count()) {
      await box.click({ force: true });
      await box.type('What was this page approved against?', { delay: 20 });
      await page.keyboard.press('Enter');
      console.log('asked');
      await page.waitForTimeout(25000);
      const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
      const idx = body.indexOf('approved against');
      console.log('REPLY SNIP:', body.slice(Math.max(0, idx - 100), idx + 700));
    } else console.log('no textbox');
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
