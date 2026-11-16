const { chromium } = require('playwright');
const DETAILS = 'Approval drift was built for Codegeist 2026 in the Apps for Business Teams category, with the Best Agents (Rovo) bonus in mind. It is MIT licensed, the source is public at github.com/Csq57/approval-drift, and it is eligible for the Runs on Atlassian programme: the app makes no external network calls and stores everything on the page it approves. The comparison logic ships with 10 automated tests that run without credentials. A demo video walks through the live page, the stale state and the Rovo agent.';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  for (const name of ['Audit', 'Compliance', 'Automation', 'Checklist']) {
    const kw = page.locator('#react-select-6-input').first();
    await kw.click({ force: true });
    await page.waitForTimeout(1500);
    const opt = page.locator('[role=option]').filter({ hasText: new RegExp('^' + name + '$') }).first();
    if (await opt.count()) { await opt.click({ force: true }); console.log('关键词:', name); }
    await page.waitForTimeout(900);
  }

  // more details: contenteditable
  const ed = page.locator('[contenteditable=true]').filter({ hasNot: page.locator('#ask') }).first();
  if (await ed.count()) {
    await ed.click({ force: true });
    await ed.pressSequentially(DETAILS, { delay: 0 }).catch(async () => { await page.keyboard.type(DETAILS); });
    await page.waitForTimeout(1200);
    console.log('more details 长度:', (await ed.innerText().catch(() => '')).length);
  } else console.log('contenteditable 未找到');

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
