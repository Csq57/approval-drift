const path = require('path');
const { chromium } = require('playwright');
const LOGO = path.join(__dirname, '..', 'shots', 'mp-logo.png');
const S1 = path.join(__dirname, '..', 'shots', 'mp-shot-valid.png');
const S2 = path.join(__dirname, '..', 'shots', 'mp-shot-stale.png');
const TAG = 'Knows the moment an approval no longer matches the page it was approved on';
const SUM = 'An approval is a claim about specific facts. Approval drift stores the approved values on the page and recomputes the comparison on every render, naming the field that moved. It is a pure function with tests; no model sits in the loop.';
const DETAILS = 'Approval drift was built for Codegeist 2026 in the Apps for Business Teams category, with the Best Agents (Rovo) bonus in mind. MIT licensed, source public at github.com/Csq57/approval-drift, eligible for Runs on Atlassian: no external network calls, everything stored on the page it approves. The comparison logic ships with 10 automated tests.';
const NOTES = 'First Marketplace release. Approval drift keeps an approval honest: it stores the approved values as a content property on the page, recomputes the comparison on every render, and names the field that moved. Includes a Rovo agent that reports what a page was approved against.';

async function fillByName(page, sel, val) {
  const el = page.locator(sel).first();
  if (!(await el.count())) return 'missing:' + sel;
  await el.click({ force: true }).catch(() => {});
  await el.fill(val);
  await el.press('Tab').catch(() => {});
  await page.waitForTimeout(600);
  return 'ok';
}
async function pick(page, selIdx, text, exact) {
  const inp = page.locator('input[id^=react-select]').nth(selIdx);
  if (!(await inp.count())) return 'no select ' + selIdx;
  await inp.click({ force: true });
  await page.waitForTimeout(1500);
  const re = exact ? new RegExp('^' + text + '$') : new RegExp('^' + text);
  const o = page.locator('[role=option]').filter({ hasText: re }).first();
  if (!(await o.count())) return 'no option ' + text;
  await o.click({ force: true });
  await page.waitForTimeout(800);
  return 'ok';
}
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  console.log('logo:', await (async () => {
    const cp = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
    await page.getByRole('button', { name: /Upload logo/i }).first().click({ force: true }).catch(() => {});
    const ch = await cp;
    if (!ch) return 'no chooser';
    await ch.setFiles(LOGO); await page.waitForTimeout(3500); return 'ok';
  })());

  console.log('tagline:', await fillByName(page, 'input[name=tagLine]', TAG));
  console.log('summary:', await fillByName(page, 'textarea[name=summary]', SUM));
  console.log('cat1:', await pick(page, 0, 'Security and compliance', false));
  console.log('cat2:', await pick(page, 0, 'Project management', false));
  console.log('kw1:', await pick(page, 1, 'Audit', true));
  console.log('kw2:', await pick(page, 1, 'Compliance', true));
  console.log('kw3:', await pick(page, 1, 'Automation', true));
  console.log('kw4:', await pick(page, 1, 'Checklist', true));
  const ed = page.locator('[contenteditable=true]').first();
  if (await ed.count()) { await ed.click({ force: true }); await page.keyboard.type(DETAILS); console.log('details ok'); }
  await page.waitForTimeout(1500);

  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 5)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
