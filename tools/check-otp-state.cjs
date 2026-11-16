const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log('PAGES:', pages.length);
  pages.forEach(p => console.log('  ', p.url().slice(0, 75)));

  const mp = pages.find(p => p.url().includes('marketplace.atlassian.com'));
  console.log('MP 页面还在:', !!mp);
  if (mp) {
    const main = await mp.locator('main, [role=main]').first().innerText().catch(() => '');
    console.log('MP 状态:', main.replace(/\n+/g, ' | ').slice(0, 200));
  }

  const gmail = pages.find(p => p.url().includes('mail.google.com'));
  console.log('Gmail 页面:', gmail ? gmail.url().slice(0, 60) : '未打开');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
