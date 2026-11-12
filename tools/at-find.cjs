const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('https://www.airtasker.com/au/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('LOGINED:', /SONGQUAN|My tasks|Dashboard|Account|Log out|Sign out/i.test(t));

  for (const u of ['/account/profile/', '/account/edit/', '/users/edit/', '/account/settings/']) {
    const r = await page.goto('https://www.airtasker.com' + u, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null);
    await page.waitForTimeout(2500);
    const txt = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    const hasForm = await page.locator('textarea, input[name*="about" i], input[name*="title" i], [contenteditable=true]').count();
    console.log(u, '| HTTP', r && r.status(), '| form fields', hasForm, '|', txt.slice(0, 90));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
