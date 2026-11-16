const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com') || p.url().includes('step-up')) || context.pages()[0];
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  console.log('URL:', page.url().slice(0, 95));
  const main = await page.locator('main, [role=main]').first().innerText().catch(() => '');
  console.log('PAGE:', main.replace(/\n{2,}/g, ' | ').slice(0, 300));
  const otp = page.locator('#otp-code-input');
  console.log('输入框可编辑:', await otp.isEditable().catch(() => '?'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
