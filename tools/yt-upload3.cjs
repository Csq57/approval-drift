const path = require('path');
const { chromium } = require('playwright');
const FILE = path.join(__dirname, '..', 'approval-drift-demo.mp4');
const TITLE = 'Approval drift — Codegeist 2026';
const DESC = `A Confluence macro and a Rovo agent that tell you the moment an approval stops matching the thing it approved.

An approval is a decision about one exact set of facts: an amount, a scope, a supplier, a delivery date. Someone approves those values. Then the page changes, and the approval quietly keeps asserting something that is no longer true.

Approval drift stores the approved values as a content property on the page, recomputes the comparison in the browser on every render, and reports exactly which field moved and in which direction. The verdict is a pure function with tests, not a model's opinion. The Rovo agent can tell you what was approved and by whom, and is explicitly not allowed to rule on whether it still holds.

Repo: https://github.com/Csq57/approval-drift
Built for Codegeist 2026. MIT licensed.`;
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);

  await page.getByRole('button', { name: /^Create$/ }).first().click({ force: true });
  await page.waitForTimeout(2500);
  await page.getByRole('menuitem', { name: /Upload videos/i }).first().click({ force: true });
  await page.waitForTimeout(6000);
  await page.locator('input[type=file]').first().setInputFiles(FILE);
  console.log('uploading file...');
  await page.waitForTimeout(25000);

  const boxes = page.locator('#textbox');
  const n = await boxes.count();
  console.log('textboxes:', n);
  if (n >= 2) {
    await boxes.nth(0).click({ force: true });
    await boxes.nth(0).fill(TITLE);
    await page.waitForTimeout(700);
    await boxes.nth(1).click({ force: true });
    await boxes.nth(1).fill(DESC);
    await page.waitForTimeout(1500);
    console.log('details filled');
  }

  for (let i = 0; i < 3; i++) {
    const next = page.getByRole('button', { name: /^Next$/ }).first();
    if (!(await next.count())) { console.log('no Next at', i); break; }
    await next.click({ force: true });
    await page.waitForTimeout(7000);
    console.log('step', i + 2);
  }

  // visibility
  const pub = page.getByRole('radio', { name: /^Public$/ }).first();
  if (await pub.count()) { await pub.click({ force: true }); await page.waitForTimeout(1500); console.log('public selected'); }
  else console.log('no public radio');

  const done = page.getByRole('button', { name: /^(Publish|Save)$/ }).first();
  if (await done.count()) { await done.click({ force: true }); await page.waitForTimeout(12000); console.log('published'); }
  else console.log('no publish button');

  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const link = (t.match(/youtu\.be\/[\w-]+|youtube\.com\/watch\?v=[\w-]+/) || [])[0];
  console.log('VIDEO LINK:', link || 'not found');
  console.log('SNIP:', t.slice(0, 260));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
