const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.locator('#participants_manage_project_overview_title').fill('Approval drift');
  await page.locator('#participants_manage_project_overview_tagline').fill(
    'A Confluence macro that tells you when an approval has quietly stopped matching the thing it approved — and shows exactly which field moved.'
  );
  await page.waitForTimeout(1000);

  // move to the details step
  await page.getByRole('link', { name: /Project details/i }).first().click().catch(async () => {
    await page.getByText('Project details', { exact: true }).first().click();
  });
  await page.waitForTimeout(6000);
  console.log('URL:', page.url());

  const fields = await page.$$eval('input:not([type=hidden]),textarea,select', els => els.map(e => ({
    tag: e.tagName, type: e.type, id: e.id, name: e.name,
    label: (e.labels && e.labels[0] ? e.labels[0].textContent : (e.getAttribute('aria-label')||''))
      .replace(/\s+/g,' ').trim().slice(0, 70)
  })).filter(f => f.type !== 'file' && f.id !== 'ask' && !/clipboard/.test(f.id)));
  console.log('FIELDS:', JSON.stringify(fields, null, 1).slice(0, 2500));
  await page.screenshot({ path: 'shots/dp-details.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
