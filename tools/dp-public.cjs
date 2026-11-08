const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://devpost.com/software/approval-drift', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  console.log('TITLE:', await page.title());
  console.log('HAS_VIDEO:', /youtu\.be|youtube/i.test(await page.content()));
  console.log('HAS_REPO:', /Csq57\/approval-drift/.test(body));
  console.log('TAGS:', ((body.match(/Built with[\s\S]{0,120}/) || [''])[0]));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
