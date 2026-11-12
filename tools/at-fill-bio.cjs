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
  const orig = await box.inputValue();
  console.log('ORIGINAL len:', orig.length);
  if (!orig.includes(OLD)) { console.log('ANCHOR MISSING — aborting'); await browser.close(); return; }

  const next = orig.replace(OLD, NEW);
  console.log('NEW len:', next.length, '(max 2000)');
  await box.fill(next);
  await page.waitForTimeout(1200);
  const counter = await page.$$eval('*', els => els.map(e => (e.textContent||'').trim()).filter(x => /^\d+\s*\/\s*2000$/.test(x)).slice(0,1));
  console.log('COUNTER:', JSON.stringify(counter));
  console.log('VERIFY TAIL:', next.slice(-120));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
