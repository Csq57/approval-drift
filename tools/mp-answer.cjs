const { chromium } = require('playwright');
const ANSWERS = {
  'dataAccessAndStorage.appStoresEUDOutsideAtlassian': 1,
  'dataAccessAndStorage.appProcessEUDOutsideAtlassian': 1,
  'logDetails.logEndUserData': 1,
  'logDetails.logProcessAndOrStoreEUDOutsideAtlassian': 1,
  'dataAccessAndStorage.appExposesRemoteRestApis': 1,
  'logDetails.logEUDShareWithThirdParty': 1,
  'logDetails.logsIntegralForAppFunctionality': 1,
  'dataResidency.isDataResidencySupported': 2,
  'security.hasCompliantCertifications': 1,
  'security.caiq.isCAIQCompleted': 1,
  'security.requiresUsersToProvidePATs': 1,
  'privacy.gdpr.dataController.isAppDataController': 0,
  'privacy.gdpr.dataProcessor.isAppDataProcessor': 1,
  'privacy.ccpa.business.isAppBusiness': 1,
  'privacy.ccpa.serviceProvider.isAppServiceProvider': 1,
};
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 120000 });
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('marketplace.atlassian.com')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1200);

  const result = await page.evaluate((answers) => {
    const log = [];
    for (const [name, idx] of Object.entries(answers)) {
      const radios = [...document.querySelectorAll(`input[name="${name}"]`)];
      if (!radios.length) { log.push(name + ': missing'); continue; }
      const r = radios[idx];
      if (!r) { log.push(name + ': no idx ' + idx); continue; }
      r.click();
      log.push(name.split('.').pop() + ': clicked');
    }
    return log;
  }, ANSWERS);
  console.log(result.join('\n'));
  await page.waitForTimeout(2500);

  const state = await page.evaluate((answers) => {
    const out = {};
    for (const [name] of Object.entries(answers)) {
      const radios = [...document.querySelectorAll(`input[name="${name}"]`)];
      out[name.split('.').pop()] = radios.some(r => r.checked);
    }
    return out;
  }, ANSWERS);
  console.log('已答:', JSON.stringify(state));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
