const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developer.atlassian.com') || p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1400, height: 1000 });
  const r = await page.goto('https://marketplace.atlassian.com/manage/apps/create', { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => null);
  await page.waitForTimeout(10000);
  console.log('HTTP:', r && r.status(), '| URL:', page.url().slice(0, 100));
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('BODY:', t.slice(0, 700));
  const fields = await page.$$eval('input, select, textarea, button', els => els.map(e => ({
    tag: e.tagName.toLowerCase(), id: e.id||'', name: e.name||'', type: e.type||'',
    txt: (e.tagName === 'BUTTON' || e.tagName === 'SELECT') ? (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40) : '',
    ph: e.placeholder || '',
  })).filter(f => f.id || f.name || f.txt).slice(0, 30));
  console.log('FIELDS:', JSON.stringify(fields).slice(0, 1500));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
