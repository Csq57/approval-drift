const { chromium } = require('playwright');

const PROFILE = process.env.TEMP + '\\forge-record-profile';
const URL =
  'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/2026-11-08+17+13';

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ['--no-first-run', '--no-default-browser-check'],
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'docs/verify-auth.png' });
  const title = await page.title();
  const bodyText = (await page.textContent('body')) || '';
  console.log('TITLE:', title);
  console.log('HAS_MACRO:', /Approval drift/i.test(bodyText));
  console.log('SIGNED_IN:', !/登录|Log in|Sign in/i.test(title));
  await context.close();
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
