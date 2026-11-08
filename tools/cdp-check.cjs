const { chromium } = require('playwright');

const URL =
  'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/2026-11-08+17+13';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(15000);
  await page.screenshot({ path: 'docs/cdp-check.png' });
  const title = await page.title();
  const text = (await page.textContent('body')) || '';
  console.log('TITLE:', title);
  console.log('AUTHED:', !/登录|Log in|Sign in/i.test(title));
  console.log('MACRO:', /Approval drift/i.test(text));
  console.log('STATUS_LINE:', (text.match(/Approval still matches|Stale:[^\n]*/i) || ['none'])[0]);
  await browser.close();
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
