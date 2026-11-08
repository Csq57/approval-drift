const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ABOUT = fs.readFileSync(path.join(__dirname, '..', 'devpost-about.md'), 'utf8');
const VIDEO = 'https://youtu.be/UmZMlweUPuQ';
const REPO = 'https://github.com/Csq57/approval-drift';
const INSTALL = fs.readFileSync(path.join(__dirname, '..', 'install-link.txt'), 'utf8').trim();

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  console.log('URL:', page.url());

  const aboutArea = page.locator('textarea[name*="about"], #participants_manage_project_details_about');
  if (await aboutArea.count()) {
    await aboutArea.first().fill(ABOUT);
    console.log('about filled:', ABOUT.length, 'chars');
  } else {
    const all = await page.locator('textarea').count();
    console.log('about textarea not found; textareas on page:', all);
  }

  const tagInput = page.locator('#software_tag_list');
  if (await tagInput.count()) {
    for (const t of ['Forge','Confluence','JavaScript','Node.js','HTML','CSS','REST API','esbuild']) {
      await tagInput.scrollIntoViewIfNeeded();
      await tagInput.click({ force: true });
      await tagInput.type(t, { delay: 30 });
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(250);
    }
    console.log('tags:', await tagInput.evaluate(el => el.value || '').catch(() => 'n/a'));
  }

  const url0 = page.locator('#software_urls_attributes_0_url');
  if (await url0.count()) { await url0.scrollIntoViewIfNeeded(); await url0.fill(INSTALL); }

  const video = page.locator('#software_video_url');
  if (await video.count()) { await video.scrollIntoViewIfNeeded(); await video.fill(VIDEO); }

  const more = page.locator('a,button,span').filter({ hasText: /ADD ANOTHER LINK/i }).first();
  if (await more.count()) {
    await more.scrollIntoViewIfNeeded();
    await more.click({ force: true }).catch(() => {});
    await page.waitForTimeout(1000);
    const url1 = page.locator('#software_urls_attributes_1_url');
    if (await url1.count()) { await url1.scrollIntoViewIfNeeded(); await url1.fill(REPO); console.log('repo link filled'); }
    else console.log('second url field not present');
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'shots/dp-details-filled.png', fullPage: true });
  console.log('video:', await video.inputValue().catch(() => 'n/a'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
