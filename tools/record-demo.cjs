const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL =
  'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/2026-11-08+17+13';
const OUT = path.join(__dirname, '..', 'frames');

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  const frame = page.frameLocator('iframe[title*="Embedded app content"]');
  const amount = frame.locator('#f-amount');
  const approve = frame.locator('#approve');
  await amount.waitFor({ state: 'visible', timeout: 60000 });

  let n = 0;
  let capturing = true;
  const capture = (async () => {
    while (capturing) {
      const file = path.join(OUT, `f${String(n).padStart(5, '0')}.jpg`);
      try {
        await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
        n += 1;
      } catch (e) {
        /* transient */
      }
      await page.waitForTimeout(70);
    }
  })();

  const hold = (ms) => page.waitForTimeout(ms);

  // 1. establish a known approval: the request as it stands, approved now
  await amount.fill('1600');
  await hold(600);
  await approve.click();
  await hold(3000);

  // 2. edit: the request moves away from the approval
  await amount.fill('1850');
  await hold(4500);

  // 3. re-approve
  await approve.click();
  await hold(4500);

  capturing = false;
  await capture;
  console.log('frames captured:', n);
  console.log('final status:', await frame.locator('#status h2').textContent());
  await browser.close();
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
