const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ABOUT = fs.readFileSync(path.join(__dirname, '..', 'devpost-about.md'), 'utf8');
const INSTALL = fs.readFileSync(path.join(__dirname, '..', 'install-link.txt'), 'utf8').trim();

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(1500);
  console.log('URL:', page.url());

  await page.locator('#software_description').fill(ABOUT);
  console.log('description chars:', ABOUT.length);

  const tagInput = page.locator('#software_tag_list');
  for (const t of ['Forge','Confluence','JavaScript','Node.js','HTML','CSS','REST API','esbuild']) {
    await tagInput.click({ force: true });
    await tagInput.type(t, { delay: 30 });
    await page.waitForTimeout(450);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  console.log('tag value:', JSON.stringify(await tagInput.inputValue()));

  await page.locator('#software_urls_attributes_0_url').fill(INSTALL);
  await page.locator('#software_video_url').fill('https://youtu.be/UmZMlweUPuQ');
  console.log('links filled');

  const save = page.getByRole('button', { name: /Save/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(8000);
  console.log('after save URL:', page.url());
  await page.screenshot({ path: 'shots/dp-after-details.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
