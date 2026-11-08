const { chromium } = require('playwright');
const URL = 'https://one-atlas-csnw.atlassian.net/wiki/spaces/EO/pages/4259849/2026-11-08+17+13';
const NEW_TITLE = 'Approval drift demo';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  const res = await page.evaluate(async ({ title }) => {
    const cur = await fetch('/wiki/api/v2/pages/4259849', { credentials: 'include' }).then(r => r.json());
    const body = {
      id: String(cur.id),
      status: 'current',
      title,
      version: { number: cur.version.number + 1 },
    };
    const r = await fetch('/wiki/api/v2/pages/4259849', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: r.status, text: (await r.text()).slice(0, 300), oldTitle: cur.title, ver: cur.version.number };
  }, { title: NEW_TITLE });
  console.log(JSON.stringify(res));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
