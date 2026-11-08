const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 900 });

  const opened = await page.getByRole('button', { name: /打开 Rovo 聊天|Rovo 聊天/ }).first()
    .click({ force: true }).then(() => 'clicked').catch(() => 'no-button');
  console.log('open:', opened);
  await page.waitForTimeout(8000);

  const frames = page.frames();
  console.log('frames:', frames.length);
  for (const f of frames) {
    const t = await f.evaluate(() => (document.body && document.body.innerText || '').replace(/\s+/g, ' ')).catch(() => '');
    console.log(' -', f.url().slice(0, 70), '| text', t.length, '| agent?', /Approval drift auditor/.test(t));
    if (/Approval drift auditor/.test(t)) console.log('   HIT:', t.slice(0, 200));
  }
  await page.screenshot({ path: 'shots/rovo-open.png' }).catch(() => {});
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
