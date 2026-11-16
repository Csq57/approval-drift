const { chromium } = require('playwright');
const SPACE = 'b4bd9f6f-393a-469c-9a7d-ebb470c8c275';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer.atlassian.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 950 });

  for (const u of [
    `https://developer.atlassian.com/console/developer-space/${SPACE}/settings`,
    `https://developer.atlassian.com/console/developer-space/${SPACE}`,
  ]) {
    const r = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await page.waitForTimeout(7000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    console.log(u.split('/console/')[1].slice(0, 50), '| HTTP', r && r.status(), '| len', t.length);
    console.log('   has "Make public":', /Make public on Marketplace/i.test(t));
    if (/Make public on Marketplace/i.test(t)) {
      const i = t.indexOf('Make public on Marketplace');
      console.log('   CTX:', t.slice(Math.max(0, i - 260), i + 320));
      break;
    }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
