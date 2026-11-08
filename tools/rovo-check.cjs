const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/Approval+drift+demo', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const body = ((await page.textContent('body'))||'').replace(/\s+/g,' ');
  console.log('PAGE_OK:', /Approval drift/i.test(body));
  const hasRovo = /Rovo/i.test(body);
  console.log('ROVO_IN_UI:', hasRovo);
  const btn = page.getByRole('button', { name: /Rovo/i }).first();
  console.log('rovo button count:', await page.getByRole('button', { name: /Rovo/i }).count());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
