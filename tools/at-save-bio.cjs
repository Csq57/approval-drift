const { chromium } = require('playwright');
const OLD = 'My portfolio shows a reproducible Excel/CSV cleaning and Python automation demo using fictional data.';
const NEW = 'Beyond client work I build and ship small tools, and they show how I work better than any summary: a purchasing assistant that reads a stock sheet and drafts a purchase order inside a budget enforced on the server rather than in the AI instructions, and a Confluence app that flags the moment an approval has quietly stopped being true. Both ship with automated tests and run without credentials, so you can check them before hiring me.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('https://www.airtasker.com/account/portfolio/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);

  const box = page.locator('#_r_1_control');
  let cur = await box.inputValue();
  console.log('loaded len:', cur.length, '| already new?', cur.includes('Beyond client work'));

  if (!cur.includes('Beyond client work')) {
    if (!cur.includes(OLD)) { console.log('ANCHOR MISSING'); await browser.close(); return; }
    await box.fill(cur.replace(OLD, NEW));
    await page.waitForTimeout(1000);
  }

  const save = page.getByRole('button', { name: /Save changes/i }).first();
  await save.click({ force: true });
  await page.waitForTimeout(6000);
  console.log('saved, url:', page.url().slice(0, 70));

  await page.goto('https://www.airtasker.com/account/portfolio/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  const after = await page.locator('#_r_1_control').inputValue();
  console.log('AFTER RELOAD len:', after.length, '| persisted?', after.includes('Beyond client work'));
  console.log('HEAD:', after.slice(0, 160));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
