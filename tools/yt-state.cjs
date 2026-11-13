const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  for (const p of context.pages()) {
    if (!p.url().includes('studio.youtube.com')) continue;
    console.log('PAGE:', p.url().slice(0, 90));
    const t = ((await p.textContent('body').catch(() => '')) || '').replace(/\s+/g, ' ');
    console.log('  head:', t.slice(0, 180));
    const radios = await p.$$eval('tp-yt-paper-radio-button', els => els.map(e => (e.textContent||'').trim().slice(0,12))).catch(() => []);
    console.log('  radios:', JSON.stringify(radios));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
