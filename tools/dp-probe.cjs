const { chromium } = require('playwright');
const CANDIDATES = ['project-overview', 'project-overview/edit', 'project_overview/edit', 'edit'];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  const BASE = 'https://devpost.com/submit-to/31572-codegeist-2026-build-with-context-ship-with-confidence/manage/submissions/1288726';
  for (const c of CANDIDATES) {
    try {
      const res = await page.goto(`${BASE}/${c}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      const has = await page.locator('#participants_manage_project_overview_title').count();
      console.log(c, '->', res && res.status(), 'titleInput:', has, 'url:', page.url().split('/').slice(-1)[0]);
      if (has) break;
    } catch (e) { console.log(c, 'ERR', e.message.slice(0, 60)); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
