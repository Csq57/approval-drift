const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !p.url().includes('studio.youtube.com')) || context.pages()[0];
  const r = await page.goto('https://www.youtube.com/watch?v=bpcKyQ9qhKE', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null);
  await page.waitForTimeout(6000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('HTTP:', r && r.status());
  console.log('UNAVAILABLE?', /unavailable|private/i.test(t));
  console.log('TITLE:', (t.match(/Approval drift[^|]{0,40}/) || ['?'])[0]);
  console.log('SNIP:', t.slice(0, 220));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
