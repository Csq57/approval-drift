const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--incognito'] });
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 800 } });
  const page = await ctx.newPage();
  for (const u of ['https://marketplace.atlassian.com/apps/1264724096', 'https://marketplace.atlassian.com/vendors/827077427']) {
    const r = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await page.waitForTimeout(5000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    console.log(u, '| HTTP', r && r.status(), '| 404:', /couldn.t find the page/i.test(t), '| 含 Approval:', /Approval drift/i.test(t));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
