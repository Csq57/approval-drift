const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const video = await page.locator('#software_video_url').inputValue().catch(()=> '');
  const desc = await page.locator('#software_description').inputValue().catch(()=> '');
  const name = await page.locator('#software_name').inputValue().catch(()=> '');
  const tagline = await page.locator('#software_tagline').inputValue().catch(()=> '');
  const url0 = await page.locator('#software_urls_attributes_0_url').inputValue().catch(()=> '');
  const tags = await page.locator('#software_tag_list').inputValue().catch(()=> '');
  console.log('name:', JSON.stringify(name));
  console.log('tagline:', JSON.stringify(tagline.slice(0,60)));
  console.log('desc:', desc.length, 'video:', JSON.stringify(video), 'url0:', url0.length, 'tags:', JSON.stringify(tags));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
