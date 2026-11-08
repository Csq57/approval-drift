const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const INSTALL = fs.readFileSync(path.join(__dirname, '..', 'install-link.txt'), 'utf8').trim();

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(800);
  console.log('URL:', page.url());

  for (const t of ['Forge', 'Confluence', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'esbuild', 'REST API']) {
    const input = page.locator('.select2-input, #s2id_autogen1 input').first();
    if (!(await input.count())) { console.log('no input for', t); break; }
    await input.click({ force: true });
    await input.type(t, { delay: 55 });
    await page.waitForTimeout(900);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
  }
  const chips = await page.$$eval('.tag, .select2-search-choice', els => els.map(e => e.textContent.trim()));
  console.log('CHIPS:', JSON.stringify(chips));

  const video = page.locator('#software_video_url');
  if (await video.count()) { await video.fill('https://youtu.be/UmZMlweUPuQ'); }
  const url0 = page.locator('#software_urls_attributes_0_url');
  if (await url0.count()) { await url0.fill(INSTALL); }
  console.log('video:', await video.inputValue().catch(()=>'n/a'));
  console.log('url0 len:', (await url0.inputValue().catch(()=>'')).length);

  const save = page.getByRole('button', { name: /Save\s*&\s*continue/i }).first();
  await save.scrollIntoViewIfNeeded();
  await save.click({ force: true });
  await page.waitForTimeout(8000);
  console.log('after save:', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
