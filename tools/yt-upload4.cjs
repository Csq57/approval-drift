const path = require('path');
const { chromium } = require('playwright');
const FILE = path.join(__dirname, '..', 'approval-drift-demo.mp4');
const TITLE = 'Approval drift — Codegeist 2026 (v2, real page)';
const DESC = `A Confluence macro and a Rovo agent that tell you the moment an approval stops matching the thing it approved.

Repo: https://github.com/Csq57/approval-drift
Built for Codegeist 2026. MIT licensed.`;
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto('https://studio.youtube.com/channel/UCpUDvEObq8VlxlebLfv9fSA/videos/upload', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);

  await page.locator('input[type=file]').first().setInputFiles(FILE).catch(async () => {
    await page.getByRole('button', { name: /Select files/i }).first().click({ force: true });
  });
  console.log('file submitted');
  await page.waitForTimeout(22000);

  const boxes = page.locator('#textbox');
  if (await boxes.count() >= 2) {
    await boxes.nth(0).click({ force: true }); await boxes.nth(0).fill(TITLE);
    await boxes.nth(1).click({ force: true }); await boxes.nth(1).fill(DESC);
    await page.waitForTimeout(1500);
    console.log('details filled');
  }

  for (let i = 0; i < 3; i++) {
    const next = page.getByRole('button', { name: /^Next$/ }).first();
    if (!(await next.count())) { console.log('no Next at', i); break; }
    await next.click({ force: true });
    await page.waitForTimeout(8000);
    const radios = await page.$$eval('tp-yt-paper-radio-button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,32)));
    console.log('step', i + 2, 'radios:', JSON.stringify(radios));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
