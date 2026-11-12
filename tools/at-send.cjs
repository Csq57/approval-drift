const { chromium } = require('playwright');
const MSG = `Hi Amanda, hope the spreadsheet is still behaving.

Quick favour, not a job: I built a small tool for a hackathon and I'm trying to find out whether it's actually useful or just clever. It reads a stock list, works out what needs reordering, and drafts a purchase order inside a budget you set once — and stops instead of going over.

Do you deal with any stock or ordering in your work? If you do, would you spare ten minutes to tell me where it breaks? Nothing to install unless you want to, no charge, and I'm not selling anything. If not, no worries at all — I just thought of you first.`;
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('https://www.airtasker.com/messages/20620066/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  const box = page.locator('textarea[placeholder*="private message"]').first();
  await box.click({ force: true });
  await box.fill(MSG);
  await page.waitForTimeout(1200);
  console.log('typed len:', (await box.inputValue()).length);

  const send = page.getByRole('button', { name: /^Send$/ }).first();
  console.log('send buttons:', await page.getByRole('button', { name: /^Send$/ }).count());
  await send.click({ force: true });
  await page.waitForTimeout(6000);

  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('SENT?', body.includes('Quick favour, not a job'));
  console.log('TAIL:', body.slice(body.indexOf('Quick favour') - 60, body.indexOf('Quick favour') + 260));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
