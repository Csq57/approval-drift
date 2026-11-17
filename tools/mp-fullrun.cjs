const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const LOGO = path.join(__dirname, '..', 'shots', 'mp-logo.png');
const TAG = 'Knows the moment an approval no longer matches the page it was approved on';
const SUM = 'An approval is a claim about specific facts. Approval drift stores the approved values on the page and recomputes the comparison on every render, naming the field that moved. It is a pure function with tests; no model sits in the loop.';
const DETAILS = 'Approval drift was built for Codegeist 2026 (Apps for Business Teams, Best Agents - Rovo). MIT licensed, source at github.com/Csq57/approval-drift. Runs on Atlassian eligible: no external network calls, everything stored on the page it approves.';
const NOTES = 'First Marketplace release. Approval drift stores the approved values as a content property on the page, recomputes the comparison on every render, and names the field that moved. Includes a Rovo agent that reports what a page was approved against.';

const log = (...a) => console.log(...a);

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  const clickNext = async () => {
    const n = page.getByRole('button', { name: /^Next$/ }).first();
    if (await n.count()) { await n.click({ force: true }); await page.waitForTimeout(8000); }
  };

  // STEP 1 get started
  await clickNext();
  log('step1 done');

  // STEP 2 about
  const logoInputs = page.locator('input[type=file]');
  if (await logoInputs.count()) { try { await logoInputs.first().setInputFiles(LOGO); await page.waitForTimeout(3500); log('logo ok'); } catch (e) { log('logo fail'); } }

  const tag = page.locator('input[name=tagLine]').first();
  if (await tag.count()) { await tag.click({force:true}); await tag.fill(TAG); await tag.press('Tab'); }
  const sum = page.locator('textarea[name=summary]').first();
  if (await sum.count()) { await sum.click({force:true}); await sum.fill(SUM); await sum.press('Tab'); }
  log('tag/summary done');
  await page.waitForTimeout(1000);

  const pick = async (idx, text, exact) => {
    const inp = page.locator('input[id^=react-select]').nth(idx);
    if (!(await inp.count())) return false;
    await inp.click({ force: true }); await page.waitForTimeout(1500);
    const re = exact ? new RegExp('^' + text + '$') : new RegExp('^' + text);
    const o = page.locator('[role=option]').filter({ hasText: re }).first();
    if (!(await o.count())) { await page.keyboard.press('Escape').catch(()=>{}); return false; }
    await o.click({ force: true }); await page.waitForTimeout(800); return true;
  };
  log('cat1', await pick(0, 'Security and compliance', false));
  log('cat2', await pick(0, 'Project management', false));
  log('kw', await pick(1, 'Audit', true), await pick(1, 'Compliance', true), await pick(1, 'Automation', true), await pick(1, 'Checklist', true));

  const ed = page.locator('[contenteditable=true]').first();
  if (await ed.count()) { await ed.click({ force: true }); await page.keyboard.type(DETAILS); log('details ok'); }
  await page.waitForTimeout(1500);
  let errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  log('about 错误:', JSON.stringify(errs.slice(0,3)));

  // STEP 3 page design
  await clickNext();
  log('step3 done (basic, no images)');

  // STEP 4 version
  // release summary
  const rs = page.locator('textarea[name=releaseSummary]').first();
  if (await rs.count()) { await rs.click({force:true}); await rs.fill('Initial release: approval tracking for Confluence with a Rovo agent'); await rs.press('Tab'); }
  const ed2 = page.locator('[contenteditable=true]').first();
  if (await ed2.count()) { await ed2.click({ force: true }); await page.keyboard.type(NOTES); }
  await page.waitForTimeout(1200);

  // license
  const selects = page.locator('input[id^=react-select]');
  const n = await selects.count();
  for (let i = 0; i < n; i++) {
    await selects.nth(i).click({ force: true }); await page.waitForTimeout(1200);
    const o = page.locator('[role=option]').filter({ hasText: /^Commercial - no charge/ }).first();
    if (await o.count()) { await o.click({ force: true }); log('license ok'); break; }
    await page.keyboard.press('Escape').catch(()=>{});
  }
  const doc = page.locator('input[name=documentationUrl]').first();
  if (await doc.count()) { await doc.click({force:true}); await doc.fill('https://github.com/Csq57/approval-drift#readme'); await doc.press('Tab'); }
  const eula = page.locator('input[name=bonTermsSupported][value=true]').first();
  if (await eula.count()) { await eula.check({ force: true }); log('EULA yes'); }
  await page.waitForTimeout(1500);
  errs = await page.$$eval('[class*=error]', els => els.map(e => (e.textContent||'').trim()).filter(Boolean));
  log('version 错误:', JSON.stringify(errs.slice(0,4)));

  const client = await context.newCDPSession(page);
  const shot = async (name) => { const { data } = await client.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(`shots/${name}.png`, Buffer.from(data, 'base64')); };
  await shot('mp-ready');
  log('screenshot mp-ready');

  // submit
  const submit = page.getByRole('button', { name: /^Submit$/ }).first();
  log('submit 存在:', await submit.count());
  if (await submit.count()) { await submit.click({ force: true }); await page.waitForTimeout(9000); }
  const dlg = await page.$$eval('[role=dialog]', els => (els[els.length-1]?.textContent || '').replace(/\s+/g,' ').slice(0, 160));
  log('弹窗:', dlg);
  await shot('mp-agree');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
