const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--incognito'] });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  for (const u of [
    'https://marketplace.atlassian.com/apps/1264724096/approval-drift',
    'https://marketplace.atlassian.com/apps/1264724096/approval-drift-for-confluence',
    'https://marketplace.atlassian.com/search?query=approval%20drift',
  ]) {
    const r = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await page.waitForTimeout(5000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    console.log(u.slice(-50), '| HTTP', r && r.status(), '| found:', /Approval drift/i.test(t), '| 404:', /couldn.t find the page/i.test(t));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
