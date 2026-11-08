const { chromium } = require('playwright');
const URL = 'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/Approval+drift+demo';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('one-atlas-csnw')) || context.pages()[0];
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(12000);
  const frames = page.frames();
  for (const f of frames) {
    const probe = await f.evaluate(() => document.body && document.body.dataset ? document.body.dataset.actionProbe : null).catch(() => null);
    if (probe) { console.log('PROBE TEXT:', probe.slice(0, 700)); break; }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
