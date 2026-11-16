const { chromium } = require('playwright');
const SPACE = 'b4bd9f6f-393a-469c-9a7d-ebb470c8c275';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer.atlassian.com')) || context.pages()[0];
  await page.goto(`https://developer.atlassian.com/console/developer-space/${SPACE}/settings`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(9000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('URL:', page.url().slice(0, 90));
  console.log('LEN:', t.length);
  console.log('BODY:', t.slice(0, 900));
  const links = await page.$$eval('a', els => els.map(e => e.getAttribute('href')||'').filter(h => /marketplace|vendors/.test(h)));
  console.log('MP LINKS:', JSON.stringify([...new Set(links)]));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
