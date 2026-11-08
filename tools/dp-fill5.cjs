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
  await page.waitForTimeout(1000);
  console.log('URL:', page.url());
  console.log('desc len now:', await page.locator('#software_description').inputValue().then(v => v.length).catch(()=>-1));

  const container = page.locator('#s2id_autogen1');
  console.log('select2 container count:', await container.count());
  if (await container.count()) {
    await container.click({ force: true });
    await page.waitForTimeout(500);
    const input = page.locator('#s2id_autogen1 input, .select2-input').first();
    for (const t of ['Forge','Confluence','JavaScript','Node.js','HTML','CSS','REST API','esbuild']) {
      await input.type(t, { delay: 40 });
      await page.waitForTimeout(700);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(350);
    }
    const chips = await page.$$eval('.tag, .select2-search-choice', els => els.map(e => e.textContent.trim()).slice(0, 12));
    console.log('chips:', JSON.stringify(chips));
  }

  await page.locator('#software_urls_attributes_0_url').fill(INSTALL);
  await page.locator('#software_video_url').fill('https://youtu.be/UmZMlweUPuQ');
  console.log('links filled');

  const save = page.getByRole('button', { name: /Save/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(8000);
  console.log('after save URL:', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
