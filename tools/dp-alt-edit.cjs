const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const u of ['https://devpost.com/software/approval-drift/edit', 'https://devpost.com/software/approval-drift']) {
    try {
      const r = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000);
      const has = await page.locator('#software_video_url').count();
      console.log(u, '->', r && r.status(), 'videoField:', has, 'final:', page.url());
      if (has) break;
    } catch (e) { console.log(u, 'ERR', e.message.slice(0,60)); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
