const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('http://127.0.0.1:8799/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  const status = await page.locator('#status').textContent().catch(() => '(no #status)');
  const rows = await page.locator('.ag-center-cols-container .ag-row, tbody tr').count().catch(() => -1);
  console.log('STATUS:', (status||'').replace(/\s+/g,' ').slice(0, 160));
  console.log('ROWS:', rows);
  const approveDisabled = await page.locator('#approveBtn').isDisabled().catch(() => 'n/a');
  console.log('APPROVE_DISABLED:', approveDisabled);
  await page.screenshot({ path: 'C:/Users/Chan/Documents/paypal_al_hackathon/docs/screenshot-reload.png' }).catch(()=>{});
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
