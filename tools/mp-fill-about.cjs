const path = require('path');
const { chromium } = require('playwright');
const LOGO = path.join(__dirname, '..', 'shots', 'mp-logo.png');
const TAGLINE = 'Knows the moment an approval no longer matches the page it was approved on';
const SUMMARY = 'Approval drift treats an approval as a claim about specific facts and checks it every time the page renders. Approve a set of values once; change any of them and the panel turns red immediately, naming the field and the direction. The verdict is a pure function with tests, stored on the page as a content property. A Rovo agent can report what was approved and by whom, and never rules on whether it still holds.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  const inputs = await page.$$eval('input:not([type=hidden]), textarea', els => els.filter(e => e.offsetWidth||e.offsetHeight).map((e,i) => ({ i, id: e.id||'', name: e.name||'', type: e.type, val: (e.value||'').slice(0,25) })));
  console.log('INPUTS:', JSON.stringify(inputs));

  const file = page.locator('input[type=file]').first();
  if (await file.count()) { await file.setInputFiles(LOGO); console.log('logo uploaded'); await page.waitForTimeout(4000); }

  const tagline = page.locator('input[name*=tagline], input[id*=tagline]').first();
  const t2 = (await tagline.count()) ? tagline : page.locator('input[type=text]').nth(1);
  await t2.fill(TAGLINE);
  console.log('tagline:', await t2.inputValue());

  const summary = page.locator('textarea').first();
  await summary.fill(SUMMARY);
  console.log('summary len:', (await summary.inputValue()).length);

  await page.waitForTimeout(1500);
  const errs = await page.$$eval('[class*=error], [role=alert]', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 4)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
