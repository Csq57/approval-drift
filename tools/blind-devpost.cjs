const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--incognito'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const t0 = Date.now();
  await page.goto('https://devpost.com/software/approval-drift', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  console.log('加载耗时(ms):', Date.now() - t0);

  const visible = await page.evaluate(() => {
    const txt = (document.body.innerText || '').replace(/\n{3,}/g, '\n');
    const iframes = [...document.querySelectorAll('iframe')].map(f => f.src.slice(0, 80));
    const imgs = [...document.querySelectorAll('img')].filter(i => i.offsetWidth > 200).map(i => i.src.slice(-40));
    return { head: txt.slice(0, 700), iframes, imgs: imgs.slice(0, 5) };
  });
  console.log('--- 首屏文本 ---');
  console.log(visible.head);
  console.log('--- 视频 iframe ---', JSON.stringify(visible.iframes));
  console.log('--- 大图 ---', JSON.stringify(visible.imgs));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
