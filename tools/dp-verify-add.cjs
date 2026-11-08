const { chromium } = require('playwright');
const P = 'participants_submission_requirements_submission_field_values_attributes';
const URL_ADD = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726-approval-drift/additional-info/edit';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto(URL_ADD, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4500);

  for (const i of [0,1,5,11,17,18]) {
    const v = await page.locator(`#${P}_${i}_value`).inputValue().catch(()=> '?');
    const sel = await page.locator(`#${P}_${i}_value option:checked`).textContent().catch(()=> '?');
    console.log(`sel${i}:`, JSON.stringify(sel || v));
  }
  for (const i of [2,3,4]) {
    console.log(`txt${i}:`, JSON.stringify(await page.locator(`#${P}_${i}_value`).inputValue().catch(()=> '?')));
  }
  for (const i of [7,8,9,10,12,15,16]) {
    const val = await page.locator(`#${P}_${i}_value`).inputValue().catch(()=> '');
    console.log(`txt${i} len:`, val.length, JSON.stringify(val.slice(0, 50)));
  }
  for (const i of [19,20,21]) {
    console.log(`box${i}:`, await page.locator(`#${P}_${i}_value`).isChecked().catch(()=> '?'));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
