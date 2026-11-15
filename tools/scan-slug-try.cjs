const { chromium } = require('playwright');
const CANDIDATES = [
  'agent-harness-on-physical-engineering-s-last-exam',
  'agent-harness-physical-engineering-s-last-exam',
  'google-agent-harness-physical-engineering-s-last-exam',
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  for (const slug of CANDIDATES) {
    const r = await page.goto('https://www.kaggle.com/competitions/' + slug, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null);
    await page.waitForTimeout(4000);
    const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
    console.log(slug, '| HTTP', r && r.status(), '| len', t.length, '|', t.slice(0, 80));
    if (t.length > 1500) {
      const i = t.indexOf('deadline');
      console.log('  DEADLINE CTX:', i > -1 ? t.slice(i, i + 200) : 'n/a');
      break;
    }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
