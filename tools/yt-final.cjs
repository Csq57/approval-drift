const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com'));
  await page.bringToFront();
  await page.waitForTimeout(3000);

  // 1. Edit draft
  const edit = page.getByText('Edit draft', { exact: false }).first();
  console.log('edit draft visible:', await edit.isVisible().catch(() => false));
  await edit.click({ force: true }).catch(e => console.log('click err', e.message.slice(0, 40)));
  await page.waitForTimeout(10000);
  console.log('url after edit draft:', page.url().slice(0, 80));

  // 2. Visibility section via left nav
  const nav = page.getByText('Visibility', { exact: true }).last();
  if (await nav.count()) { await nav.click({ force: true }); await page.waitForTimeout(4000); }

  const radios = page.locator('tp-yt-paper-radio-button');
  const n = await radios.count();
  const labels = [];
  for (let i = 0; i < n; i++) labels.push(((await radios.nth(i).textContent()) || '').trim().slice(0, 14));
  console.log('radios:', JSON.stringify(labels));

  if (n >= 3) { await radios.nth(2).click({ force: true }); await page.waitForTimeout(2500); console.log('clicked Public'); }

  // 3. final action buttons
  const btns = await page.$$eval('ytcp-button, button', els => els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(x => x && x.length < 22));
  console.log('buttons:', JSON.stringify([...new Set(btns)]));

  for (const name of [/^Publish$/, /^Save$/, /^Done$/]) {
    const b = page.getByRole('button', { name }).first();
    if (await b.count()) {
      await b.click({ force: true });
      console.log('clicked', name.toString());
      await page.waitForTimeout(10000);
      break;
    }
  }
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('FINAL STATE:', t.slice(0, 200));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
