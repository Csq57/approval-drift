const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.goto('https://devpost.com/software/approval-drift/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  const fields = await page.$$eval('input, textarea', els => els.map(e => ({ id: e.id, name: e.name, val: (e.value||'').slice(0,60) })).filter(f => /video|url/i.test(f.id + f.name)));
  console.log('VIDEO FIELDS:', JSON.stringify(fields));
  const all = await page.$$eval('input[type=text], input[type=url]', els => els.map(e => e.id || e.name).filter(Boolean));
  console.log('ALL INPUTS:', JSON.stringify(all).slice(0, 400));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
