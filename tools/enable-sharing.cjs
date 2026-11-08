const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://developer.atlassian.com/console/myapps/78531246-77fd-4df3-b3e6-981bd449e3d9/manage/distribution', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  for (const label of ['Bitbucket', 'Compass', 'Confluence', 'Ecosystem', 'Jira']) {
    const box = page.getByLabel(label, { exact: true });
    const n = await box.count();
    console.log(label, 'label-matches:', n);
  }

  const conf = page.getByLabel('Confluence', { exact: true }).first();
  if (await conf.count()) {
    await conf.check({ force: true }).catch(async () => { await conf.click({ force: true }); });
    console.log('clicked Confluence');
  } else {
    console.log('no Confluence label; trying nth checkbox');
    const boxes = page.locator('input[type=checkbox]');
    for (let i = 0; i < await boxes.count(); i++) {
      const b = boxes.nth(i);
      const parentText = (await b.evaluate(el => (el.closest('label') || el.parentElement)?.textContent || '')).trim();
      console.log(' box', i, JSON.stringify(parentText.slice(0, 40)));
    }
  }

  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'shots/dist-after.png', fullPage: true });
  const text = (await page.textContent('body')) || '';
  const links = [...text.matchAll(/https:\/\/[^\s]{10,200}/g)].map(m => m[0]).filter(u => /install/i.test(u));
  console.log('install links:', JSON.stringify(links.slice(0, 3)));
  const hasLink = /Installation link[\s\S]{0,80}(https:\/\/\S+)/i.exec(text);
  console.log('raw:', hasLink ? hasLink[1] : 'none');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
