const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('devpost.com')) || context.pages()[0];
  await page.waitForTimeout(1000);
  const labels = await page.evaluate(() => {
    const pick = (idx) => {
      const t = document.querySelector('#participants_submission_requirements_submission_field_values_attributes_' + idx + '_value');
      if (!t) return 'missing';
      const cont = t.closest('div, fieldset, section');
      return cont ? (cont.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 400) : '';
    };
    return { f6: pick(6), f8: pick(8) };
  });
  console.log('=== f6 ===\n', labels.f6);
  console.log('=== f8 ===\n', labels.f8.slice(0, 300));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
