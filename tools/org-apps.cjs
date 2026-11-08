const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('admin.atlassian.com')) || context.pages()[0];
  const base = page.url().split('/o/')[0] + '/o/' + page.url().split('/o/')[1].split('/')[0];
  console.log('ORG BASE:', base);

  await page.goto(base + '/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('APPS PAGE:', t.slice(300, 1100));
  const hosts = [...new Set((t.match(/[a-z0-9-]+\.atlassian\.net/gi) || []))];
  console.log('HOSTS FOUND:', JSON.stringify(hosts));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
