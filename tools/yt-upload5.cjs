const path = require('path');
const { chromium } = require('playwright');
const FILE = path.join(__dirname, '..', 'approval-drift-demo.mp4');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);

  await page.getByRole('button', { name: /^Create$/ }).first().click({ force: true });
  await page.waitForTimeout(2500);
  await page.getByRole('menuitem', { name: /Upload videos/i }).first().click({ force: true });
  await page.waitForTimeout(7000);
  console.log('upload dialog inputs:', await page.locator('input[type=file]').count());
  await page.locator('input[type=file]').first().setInputFiles(FILE);
  console.log('file set');
  await page.waitForTimeout(25000);

  const bodies = [];
  for (let i = 0; i < 4; i++) {
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    const hasNext = await page.getByRole('button', { name: /^Next$/ }).count();
    const radios = await page.$$eval('tp-yt-paper-radio-button, ytcp-radio-button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26)));
    console.log(`STEP ${i}: next=${hasNext} radios=${JSON.stringify(radios)}`);
    console.log('  body:', t.slice(t.indexOf('Video details') > -1 ? t.indexOf('Video details') : 0, 220));
    if (!hasNext) break;
    await page.getByRole('button', { name: /^Next$/ }).first().click({ force: true });
    await page.waitForTimeout(8000);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
