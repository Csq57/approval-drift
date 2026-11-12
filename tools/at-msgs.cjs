const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  for (const [name, url] of [
    ['MESSAGES', 'https://www.airtasker.com/messages/'],
    ['OFFERS', 'https://www.airtasker.com/my-tasks/?filter=offers'],
  ]) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(6000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    const cut = t.indexOf('Messages') > -1 ? t.slice(Math.max(0, t.indexOf('Messages')), t.indexOf('Messages') + 900) : t.slice(0, 900);
    console.log('=== ' + name);
    console.log(cut.slice(0, 900));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
