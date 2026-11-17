const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  for (const u of ['https://marketplace.atlassian.com/apps/1264724096', 'https://marketplace.atlassian.com/apps/1264724096/approval-drift']) {
    const r = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await page.waitForTimeout(6000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    console.log(u, '| HTTP', r && r.status(), '| 含 Approval drift:', /Approval drift/i.test(t), '|', t.slice(0, 120));
    if (/Approval drift/i.test(t)) { console.log('=> 公开页面可用:', page.url()); break; }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
