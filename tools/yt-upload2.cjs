const { chromium } = require('playwright');
const TITLE = 'Approval drift — Codegeist 2026';
const DESC = `A Confluence macro and a Rovo agent that tell you the moment an approval stops matching the thing it approved.

An approval is a decision about one exact set of facts: an amount, a scope, a supplier, a delivery date. Someone approves those values. Then the page changes — a quantity, a supplier, a date — and the approval quietly keeps asserting something that is no longer true.

Approval drift stores the approved values as a content property on the page, recomputes the comparison in the browser on every render, and reports exactly which field moved and in which direction. The verdict is a pure function with tests, not a model's opinion. The Rovo agent can tell you what was approved and by whom, and is explicitly not allowed to rule on whether it still holds.

Repo: https://github.com/Csq57/approval-drift
Built for Codegeist 2026 (Apps for Business Teams · Best Agents - Rovo). MIT licensed.`;
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com')) || context.pages()[0];
  console.log('page:', page.url().slice(0, 60));

  const boxes = page.locator('div#textbox');
  console.log('textboxes:', await boxes.count());
  await boxes.nth(0).click({ force: true });
  await boxes.nth(0).fill(TITLE);
  await page.waitForTimeout(800);
  await boxes.nth(1).click({ force: true });
  await boxes.nth(1).fill(DESC);
  await page.waitForTimeout(1500);
  console.log('title set:', (await boxes.nth(0).textContent() || '').trim().slice(0, 40));

  for (let step = 0; step < 3; step++) {
    const next = page.getByRole('button', { name: /^Next$/ }).first();
    if (!(await next.count())) break;
    await next.click({ force: true });
    await page.waitForTimeout(6000);
    console.log('advanced to step', step + 2);
  }

  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('VISIBILITY STEP?', /Visibility|Public|Unlisted|Private/.test(t));
  console.log('SNIP:', t.slice(t.indexOf('Visibility') > -1 ? t.indexOf('Visibility') : 0, 260));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
