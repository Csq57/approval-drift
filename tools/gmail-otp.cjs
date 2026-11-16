const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('mail.google.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 950 });
  await page.goto('https://mail.google.com/mail/u/0/#search/atlassian', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(9000);

  const rows = await page.$$eval('tr.zA', els => els.slice(0, 6).map(e => (e.textContent||'').replace(/\s+/g, ' ').trim().slice(0, 160)));
  console.log('INBOX ROWS:');
  rows.forEach((r, i) => console.log(' ', i, r));

  // open the first row
  const first = page.locator('tr.zA').first();
  if (await first.count()) { await first.click({ force: true }); await page.waitForTimeout(6000); }
  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  const codes = [...new Set((body.match(/\b\d{8}\b/g) || []))];
  console.log('8位码候选:', JSON.stringify(codes));
  console.log('正文片段:', body.slice(0, 300));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
