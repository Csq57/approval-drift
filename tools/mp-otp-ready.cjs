const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.waitForTimeout(1000);
  console.log('URL:', page.url().slice(0, 95));
  const otp = page.locator('#otp-code-input');
  console.log('输入框仍在:', await otp.count(), '| 可编辑:', await otp.isEditable().catch(() => '?'));
  const toast = await page.locator('[role=alert], [class*=toast]').first().innerText().catch(() => '');
  console.log('提示:', (toast || '(无)').replace(/\s+/g, ' ').slice(0, 120));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
