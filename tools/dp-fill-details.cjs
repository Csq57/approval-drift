const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ABOUT = fs.readFileSync(path.join(__dirname, '..', 'devpost-about.md'), 'utf8');
const VIDEO = 'https://youtu.be/UmZMlweUPuQ';
const REPO = 'https://github.com/Csq57/approval-drift';
const INSTALL = 'https://developer.atlassian.com/console/install/78531246-77fd-4df3-b3e6-981bd449e3d9?signature=AYABeNWl1hsrBpIF3Qxw4%2FpSYEQAAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucBUWcXefjmzgd4Q%2FO35EA7IQAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDK9Y5wDiXVYiwjxBswIBEIA7qx98ayVBPTIjfUIKl1HwkAX9O0J8EwtUZai76Mx5dl36iaDkqdXDRRnA%2BUBD2TRpIGjHFtVkTJK4fZ4AB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgENeY1SBMsyzKvFE7KFUNWBAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMB%2BnUeUgcQWj3AZ%2FNAgEQgDvTIFBBQZS2VpeysE5IACKH%2FI60P%2BBgdY2Fv8W844pkOl5h8%2FppiCB9DX4lqCAR9AQgGVZ95FmQvDTzlwAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEASlQkCmsNlRDmFoXoHaUzfoAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAxE1DWHouk79WMTnTsCARCAO0jKYBvzauFSWhw9r4loDe5C8XtiwTpuuQ0kUwn8SfC%2FfeHS%2F6AGwBe50iouU1%2FPxv2%2BwKVV5afY9dpNAgAAAAAMAAAQAAAAAAAAAAAAAAAAAPZyELdpeZHMIRTJ01gxLXf%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADIcdqLKtyS5IVqu1HR26V0MESGBVuvG09KKKdW6kuPW0ZaWPvX0KUngDwckO%2BfNbj5Guvzs67%2BKNMx5H25WBDx9Vjk%3D&product=confluence';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  console.log('URL:', page.url());

  // About the project (Markdown)
  const about = page.locator('textarea').filter({ hasText: '' }).first();
  const aboutById = page.locator('#participants_manage_project_details_about, textarea[name*="about"]');
  const target = (await aboutById.count()) ? aboutById.first() : about;
  await target.fill(ABOUT);
  console.log('about bytes:', ABOUT.length);

  // Built with tags
  const tags = ['Forge', 'Confluence', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'REST API', 'esbuild'];
  const tagInput = page.locator('#software_tag_list');
  for (const t of tags) {
    await tagInput.click();
    await tagInput.type(t, { delay: 40 });
    await page.waitForTimeout(400);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  }
  console.log('tags done');

  // Try it out links
  await page.locator('#software_urls_attributes_0_url').fill(INSTALL);
  const addLink = page.getByText('ADD ANOTHER LINK', { exact: false }).first();
  if (await addLink.count()) {
    await addLink.click();
    await page.waitForTimeout(800);
    const second = page.locator('#software_urls_attributes_1_url');
    if (await second.count()) await second.fill(REPO);
  }

  // Demo video
  await page.locator('#software_video_url').fill(VIDEO);

  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'shots/dp-details-filled.png', fullPage: true });
  console.log('filled');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
