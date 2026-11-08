const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(2000);
  const fields = await page.$$eval('input:not([type=hidden]),textarea,select', els => els.map(e => ({
    tag: e.tagName, type: e.type, id: e.id, name: e.name,
    ph: (e.placeholder || '').slice(0, 50),
    label: (e.labels && e.labels[0] ? e.labels[0].textContent : (e.getAttribute('aria-label')||'')).replace(/\s+/g,' ').trim().slice(0, 60)
  })).filter(f => f.type !== 'file'));
  console.log('FIELDS:', JSON.stringify(fields, null, 1).slice(0, 2200));
  const steps = await page.$$eval('a,li,button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(t => /overview|details|submit|additional/i.test(t) && t.length < 40).slice(0,10));
  console.log('STEPS:', JSON.stringify([...new Set(steps)]));
  await page.screenshot({ path: 'shots/dp-overview.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
