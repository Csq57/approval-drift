const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('bpcKyQ9qhKE')) || context.pages()[0];
  await page.waitForTimeout(4000);

  const edit = page.getByRole('button', { name: /Edit draft/i }).first();
  console.log('edit draft btn:', await edit.count());
  if (await edit.count()) { await edit.click({ force: true }); await page.waitForTimeout(9000); }

  let body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('AFTER EDIT DRAFT:', body.slice(0, 300));
  await page.screenshot({ path: 'shots/yt-draft.png' }).catch(() => {});
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
