const { chromium } = require('playwright');
const A = [
  ['dataAccessAndStorage.appStoresEUDOutsideAtlassian', 1],
  ['dataAccessAndStorage.appProcessEUDOutsideAtlassian', 1],
  ['logDetails.logEndUserData', 1],
  ['logDetails.logProcessAndOrStoreEUDOutsideAtlassian', 1],
  ['dataAccessAndStorage.appExposesRemoteRestApis', 1],
  ['logDetails.logEUDShareWithThirdParty', 1],
  ['logDetails.logsIntegralForAppFunctionality', 1],
  ['dataResidency.isDataResidencySupported', 2],
  ['security.hasCompliantCertifications', 1],
  ['security.caiq.isCAIQCompleted', 1],
  ['security.requiresUsersToProvidePATs', 1],
  ['privacy.gdpr.dataController.isAppDataController', 0],
  ['privacy.gdpr.dataProcessor.isAppDataProcessor', 1],
  ['privacy.ccpa.business.isAppBusiness', 1],
  ['privacy.ccpa.serviceProvider.isAppServiceProvider', 1],
];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);

  let ok = 0;
  for (const [name, idx] of A) {
    const r = page.locator(`input[name="${name}"]`).nth(idx);
    if (!(await r.count())) { console.log('missing', name); continue; }
    try { await r.check({ force: true }); ok++; } catch (e) { console.log('fail', name, e.message.slice(0, 40)); }
    await page.waitForTimeout(200);
  }
  console.log('已勾选:', ok, '/', A.length);

  const save = page.getByRole('button', { name: /Save and preview/i }).first();
  if (await save.count()) { await save.click({ force: true }); console.log('已点 Save and preview'); await page.waitForTimeout(10000); }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
