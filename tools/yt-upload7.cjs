const path = require('path');
const { chromium } = require('playwright');
const FILE = path.join(__dirname, '..', 'approval-drift-demo.mp4');
const TITLE = 'Approval drift — Codegeist 2026';
const DESC = `A Confluence macro and a Rovo agent that tell you the moment an approval stops matching the thing it approved.

Repo: https://github.com/Csq57/approval-drift
Built for Codegeist 2026. MIT licensed.`;

const clickByExactText = async (page, text) => page.evaluate((t) => {
  const els = [...document.querySelectorAll('tp-yt-paper-radio-button, ytcp-button, button')];
  const hit = els.find(e => (e.textContent || '').trim() === t);
  if (!hit) return 'none';
  hit.scrollIntoView({ block: 'center' });
  const inner = hit.querySelector('button') || hit;
  ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(type =>
    inner.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window })));
  return 'ok';
}, text);

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('studio.youtube.com')) || context.pages()[0];
  await page.setViewportSize({ width: 1500, height: 980 });
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);

  await page.getByRole('button', { name: /^Create$/ }).first().click({ force: true });
  await page.waitForTimeout(2500);
  await page.getByRole('menuitem', { name: /Upload videos/i }).first().click({ force: true });
  await page.waitForTimeout(7000);
  await page.locator('input[type=file]').first().setInputFiles(FILE);
  console.log('file set, waiting');
  await page.waitForTimeout(24000);

  const boxes = page.locator('#textbox');
  if (await boxes.count() >= 2) {
    await boxes.nth(0).click({ force: true }); await boxes.nth(0).fill(TITLE);
    await boxes.nth(1).click({ force: true }); await boxes.nth(1).fill(DESC);
    await page.waitForTimeout(1500);
    console.log('details filled');
  }

  console.log('kids=no ->', await clickByExactText(page, "No, it's not made for kids"));
  await page.waitForTimeout(2000);

  for (let i = 0; i < 4; i++) {
    const next = page.getByRole('button', { name: /^Next$/ }).first();
    if (!(await next.count())) { console.log('no next at', i); break; }
    await next.click({ force: true });
    await page.waitForTimeout(9000);
    const has = await page.evaluate(() => [...document.querySelectorAll('tp-yt-paper-radio-button')].some(e => (e.textContent||'').trim() === 'Public'));
    console.log('after next', i + 1, '| Public present:', has);
    if (has) break;
  }

  console.log('public ->', await clickByExactText(page, 'Public'));
  await page.waitForTimeout(3000);
  console.log('publish ->', await clickByExactText(page, 'Publish'));
  await page.waitForTimeout(12000);
  const t = ((await page.textContent('body')) || '').replace(/\s+/g, ' ');
  console.log('LINK:', (t.match(/youtu\.be\/[\w-]+/) || ['n/a'])[0]);
  console.log('STATE:', t.slice(0, 180));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
