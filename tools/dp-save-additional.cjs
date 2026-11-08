const { chromium } = require('playwright');
const P = 'participants_submission_requirements_submission_field_values_attributes';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(800);

  for (const idx of [19, 20, 21]) {
    const lab = page.locator(`label[for="${P}_${idx}_value"]`);
    if (await lab.count()) {
      await lab.first().scrollIntoViewIfNeeded();
      await lab.first().click({ force: true });
      const checked = await page.locator(`#${P}_${idx}_value`).isChecked();
      console.log(`box ${idx} checked:`, checked);
    } else console.log(`no label for ${idx}`);
  }

  const save = page.getByRole('button', { name: /Save .?Continue/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(8000);
  console.log('after save URL:', page.url());
  await page.screenshot({ path: 'shots/dp-after-additional.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
