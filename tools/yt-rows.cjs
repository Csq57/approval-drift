const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto('https://studio.youtube.com/channel/UCpUDvEObq8VlxlebLfv9fSA/videos/upload', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(12000);
  const rows = await page.$$eval('ytcp-video-row', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0, 120)));
  console.log('ROWS:');
  rows.slice(0, 8).forEach((r, i) => console.log(' ', i, r));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
