const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => !/one-atlas-csnw|kaggle|chatgpt|mail\.google/.test(p.url())) || context.pages()[0];
  await page.goto('https://www.atlassian.com/try/cloud/signup?product=confluence.standard&edition=free', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  console.log('URL:', page.url());
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('TEXT:', t.slice(0, 700));
  const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, ph: e.placeholder || '', label: (e.labels && e.labels[0] ? e.labels[0].textContent : '').replace(/\s+/g,' ').trim().slice(0,40) })));
  console.log('INPUTS:', JSON.stringify(inputs).slice(0, 600));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
