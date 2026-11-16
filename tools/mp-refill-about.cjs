const path = require('path');
const { chromium } = require('playwright');
const LOGO = path.join(__dirname, '..', 'shots', 'mp-logo.png');
const TAG = 'Knows the moment an approval no longer matches the page it was approved on';
const SUM = 'An approval is a claim about specific facts. Approval drift stores the approved values on the page and recomputes the comparison on every render, naming the field that moved. It is a pure function with tests; no model sits in the loop.';
const DETAILS = 'Approval drift was built for Codegeist 2026 in the Apps for Business Teams category, with the Best Agents (Rovo) bonus in mind. It is MIT licensed, the source is public at github.com/Csq57/approval-drift, and it is eligible for the Runs on Atlassian programme: the app makes no external network calls and stores everything on the page it approves. The comparison logic ships with 10 automated tests that run without credentials.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1200);

  // logo via file chooser on "Upload logo"
  const cp = page.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null);
  await page.getByRole('button', { name: /Upload logo/i }).first().click({ force: true }).catch(()=>{});
  const ch = await cp;
  if (ch) { await ch.setFiles(LOGO); console.log('logo ok'); } else console.log('logo chooser 未触发');
  await page.waitForTimeout(4000);

  const tag = page.locator('#tagLine-uid262').first();
  await tag.click({ force: true }); await tag.fill(TAG); await tag.press('Tab');
  await page.waitForTimeout(1200);
  const sum = page.locator('#summary-uid263').first();
  await sum.click({ force: true }); await sum.fill(SUM); await sum.press('Tab');
  await page.waitForTimeout(1200);
  console.log('tagline len', (await tag.inputValue()).length, '| summary len', (await sum.inputValue()).length);

  for (const name of ['Security and compliance', 'Project management']) {
    await page.locator('#react-select-5-input').first().click({ force: true });
    await page.waitForTimeout(1600);
    const o = page.locator('[role=option]').filter({ hasText: new RegExp('^' + name) }).first();
    if (await o.count()) await o.click({ force: true });
    await page.waitForTimeout(900);
  }
  for (const name of ['Audit', 'Compliance', 'Automation', 'Checklist']) {
    await page.locator('#react-select-6-input').first().click({ force: true });
    await page.waitForTimeout(1400);
    const o = page.locator('[role=option]').filter({ hasText: new RegExp('^' + name + '$') }).first();
    if (await o.count()) await o.click({ force: true });
    await page.waitForTimeout(700);
  }
  const ed = page.locator('[contenteditable=true]').first();
  if (await ed.count()) { await ed.click({ force: true }); await page.keyboard.type(DETAILS); }
  await page.waitForTimeout(1500);
  const errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  console.log('错误:', JSON.stringify(errs.slice(0, 4)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
