const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com')) || context.pages()[0];
  await page.goto('https://studio.youtube.com/channel/UCpUDvEObq8VlxlebLfv9fSA/videos/upload', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(14000);
  const rows = await page.$$eval('ytcp-video-row', els => els.slice(0, 6).map(e => (e.textContent||'').replace(/\s+/g,' ').trim()));
  rows.forEach((r, i) => console.log(i, '|', r.slice(0, 200)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
