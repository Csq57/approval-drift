const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.goto('https://devpost.com/software/approval-drift', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  const html = await page.content();
  console.log('新视频嵌入:', /SiZS2QPHffs/.test(html));
  console.log('旧视频仍在页面上:', /UmZMlweUPuQ/.test(html));
  const imgs = await page.$$eval('img', els => els.filter(e => /software_photos/.test(e.src)).length);
  console.log('截图数量:', imgs);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
