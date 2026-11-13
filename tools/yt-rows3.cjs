const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com')) || context.pages()[0];
  const rows = await page.$$eval('ytcp-video-row', els => els.slice(0, 4).map(e => (e.textContent||'').replace(/\s+/g,' ').trim()));
  rows.forEach((r, i) => {
    const vis = (r.match(/\b(Public|Private|Unlisted|Draft|Scheduled)\b/g) || []).join(',');
    console.log(i, '| vis:', vis || '?', '| tail:', r.slice(-120));
  });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
