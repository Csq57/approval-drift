const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('bpcKyQ9qhKE')) || context.pages()[0];
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => {
    const out = { radios: 0, radioLabels: [], visRows: [], buttons: [] };
    out.radios = document.querySelectorAll('tp-yt-paper-radio-button, input[type=radio]').length;
    document.querySelectorAll('tp-yt-paper-radio-button').forEach(r => out.radioLabels.push((r.textContent||'').trim().slice(0,20)));
    document.querySelectorAll('*').forEach(el => {
      const t = (el.textContent||'').trim();
      if (t.length < 24 && /^Visibility/.test(t) && el.children.length <= 3) out.visRows.push(el.tagName + ':' + t);
    });
    document.querySelectorAll('ytcp-button, button').forEach(b => { const t=(b.textContent||'').trim(); if (t && t.length < 18) out.buttons.push(t); });
    return out;
  });
  console.log('radios:', info.radios, '| labels:', JSON.stringify(info.radioLabels));
  console.log('visRows:', JSON.stringify([...new Set(info.visRows)].slice(0, 6)));
  console.log('buttons:', JSON.stringify([...new Set(info.buttons)].slice(0, 20)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
