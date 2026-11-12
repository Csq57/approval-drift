const path = require('path');
const { chromium } = require('playwright');
const FILE = path.join(__dirname, '..', 'approval-drift-demo.mp4');
const TITLE = 'Approval drift — Codegeist 2026';
const DESC = `A Confluence macro and a Rovo agent that tell you the moment an approval stops matching the thing it approved.

An approval is a decision about one exact set of facts: an amount, a scope, a supplier, a delivery date. Someone approves those values. Then the page changes — a quantity, a supplier, a date — and the approval quietly keeps asserting something that is no longer true.

Approval drift stores the approved values as a content property on the page, recomputes the comparison in the browser on every render, and reports exactly which field moved and in which direction. The verdict is a pure function with tests, not a model's opinion. The Rovo agent can tell you what was approved and by whom, and is explicitly not allowed to rule on whether it still holds.

Repo: https://github.com/Csq57/approval-drift
Built for Codegeist 2026 (Apps for Business Teams · Best Agents - Rovo). MIT licensed.`;
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);

  await page.getByRole('button', { name: /^Create$/ }).first().click({ force: true });
  await page.waitForTimeout(2500);
  console.log('menu items:', await page.getByRole('menuitem').count());
  await page.getByRole('menuitem', { name: /Upload videos/i }).first().click({ force: true });
  await page.waitForTimeout(6000);

  const input = page.locator('input[type=file]').first();
  await input.setInputFiles(FILE);
  console.log('file set, waiting for details dialog...');
  await page.waitForTimeout(20000);

  const boxes = await page.$$eval('input, textarea, [contenteditable=true]', els => els.map(e => ({
    tag: e.tagName.toLowerCase(), id: e.id, type: e.type || '', len: (e.value || e.textContent || '').length,
  })).filter(x => x.id));
  console.log('FIELDS:', JSON.stringify(boxes).slice(0, 600));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
