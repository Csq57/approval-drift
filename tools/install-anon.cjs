const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const LINK = fs.readFileSync(path.join(__dirname, '..', 'install-link.txt'), 'utf8').trim();
(async () => {
  // a fresh, cookie-less context: exactly what an outside judge hits
  const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--incognito'] });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  const resp = await page.goto(LINK, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(e => { console.log('NAV ERR', e.message); return null; });
  await page.waitForTimeout(9000);
  console.log('HTTP:', resp && resp.status());
  console.log('URL:', page.url().slice(0, 100));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('HAS_APP_NAME:', /Approval drift/i.test(t));
  console.log('LINKS_TO_CONFLUENCE:', /Confluence/i.test(t));
  console.log('TEXT:', t.slice(0, 500));
  await page.screenshot({ path: 'C:/Users/Chan/Documents/codegeist2026/shots/install-anon.png' }).catch(()=>{});
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
