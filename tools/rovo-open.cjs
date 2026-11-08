const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.waitForTimeout(1000);
  const btns = await page.$$eval('button, a', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(t => /Rovo|Chat/i.test(t) && t.length < 30).slice(0,8));
  console.log('ROVO_BTNS:', JSON.stringify(btns));
  await page.getByRole('button', { name: /Rovo/i }).first().click({ force: true }).catch(async () => {
    await page.getByText('Rovo', { exact: false }).first().click({ force: true });
  });
  await page.waitForTimeout(6000);
  const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  console.log('HAS_AGENT_NAME:', /Approval drift auditor/i.test(body));
  console.log('SNIP:', body.slice(0, 400));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
