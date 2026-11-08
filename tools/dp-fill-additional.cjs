const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const INSTALL = fs.readFileSync(path.join(__dirname, '..', 'install-link.txt'), 'utf8').trim();
const P = 'participants_submission_requirements_submission_field_values_attributes';

const TEXTS = {
  2: 'N/A',
  3: 'N/A',
  4: '2026-11-07',
  7: INSTALL,
  8: [
    '1. Install the app from the installation link above onto a Confluence Cloud site where you are an admin.',
    '2. Open any page, choose Edit, type /Approval drift, and insert the "Approval drift" macro.',
    '3. Publish the page. The macro shows "No approval recorded yet".',
    '4. Press "Approve these exact values" — the panel turns green ("Approval still matches") and the message reads "Approved and saved".',
    '5. Change the Amount field to 1850. The panel turns red immediately: "Stale: amount increase since approval", with "Amount: 1600 → 1850 (critical)".',
    '6. Reload the page: the approval is still there, stored as a content property on that page.',
    'No credentials are needed beyond a Confluence site admin who can install Forge apps.',
  ].join('\n'),
  9: 'ari:cloud:ecosystem::app/78531246-77fd-4df3-b3e6-981bd449e3d9',
  10: [
    'Built entirely on the Atlassian Forge platform, and it extends Confluence:',
    '- Forge app registered in a Developer Space, deployed to the development and production environments (`forge deploy`), installed via `forge install`.',
    '- A Forge module: the `confluence` macro module (Custom UI), with a Forge resolver function.',
    '- Forge runtime: nodejs22.x, using @forge/resolver and @forge/api to call the Confluence REST API v2.',
    '- Data is stored through Confluence content properties, so it lives in the product, not beside it.',
    'The app is eligible for the Runs on Atlassian program (no external egress, all compute on Atlassian infrastructure).',
  ].join('\n'),
  12: [
    'Approvals are a business-team workflow: purchase requests, vendor onboarding, policy sign-off. The failure mode is not "nobody approved it" — it is "the approval no longer matches the thing it approved", and that is invisible until money moves. Business teams live in Confluence pages that keep being edited after sign-off, which is exactly where this drift happens.',
  ].join('\n'),
  15: [
    'Forge is genuinely pleasant for the module plumbing: manifest, deploy, install and the Runs on Atlassian program all worked as documented. What cost the most time was storage and UI rendering.',
    'Struggles: Forge KVS accepted writes and returned nothing on read, and the value did not survive a reload, so I moved the record into a Confluence page property. The v1 content-property REST endpoint returns 410 now, and v2 only accepts published page ids, so a draft page 404s until it is published. On the UI side, UI Kit 2 rendered a permanent spinner in this environment and UI Kit 1 is deprecated; Custom UI worked immediately. Inline <style> is blocked by the app iframe CSP, so styling had to move to an external stylesheet.',
    'What I would improve: clearer diagnostics when a storage call silently no-ops, and a documented, working v2 example for content properties from a resolver.',
  ].join('\n'),
  16: [
    'Claude Code (DeepSeek Harness) as the primary build agent: scaffolding, the Forge manifest, the deterministic approval logic and its tests, the Custom UI front end, and the release pipeline.',
    'OpenAI Codex (gpt-6.1) as an external reviewer for the storage and rendering failures — it was the one that said to stop fighting UI Kit and switch to Custom UI, which is what unblocked the build.',
  ].join('\n'),
};

const SELECTS = {
  0: /individual/i,          // Submitter Type
  1: /australia/i,           // Country of residence
  5: /new/i,                 // new vs existed before Oct 27 2026
  11: /business/i,           // Category
  17: /a lot/i,              // skills
  18: /very likely/i,        // likelihood
};

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.waitForTimeout(1000);
  console.log('URL:', page.url());

  for (const [idx, re] of Object.entries(SELECTS)) {
    const sel = page.locator(`#${P}_${idx}_value`);
    if (!(await sel.count())) { console.log('missing select', idx); continue; }
    const options = await sel.locator('option').allTextContents();
    const pick = options.find((o) => re.test(o)) || null;
    if (!pick) { console.log(`select ${idx}: no match in`, JSON.stringify(options.slice(0, 8))); continue; }
    await sel.selectOption({ label: pick });
    console.log(`select ${idx} -> ${pick}`);
  }

  for (const [idx, value] of Object.entries(TEXTS)) {
    const el = page.locator(`#${P}_${idx}_value`);
    if (!(await el.count())) { console.log('missing field', idx); continue; }
    await el.fill(value);
  }
  console.log('text fields filled');

  for (const idx of [19, 20, 21]) {
    const box = page.locator(`#${P}_${idx}_value`);
    if (await box.count()) {
      await box.check({ force: true }).catch(async () => { await box.click({ force: true }); });
    }
  }
  console.log('eligibility boxes checked');

  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/dp-additional-filled.png', fullPage: true });
  await browser.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
