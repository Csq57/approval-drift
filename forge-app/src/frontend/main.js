import { invoke } from '@forge/bridge';

import { snapshot, evaluate } from '../approval';

const FIELDS = [
  { key: 'amount', label: 'Amount' },
  { key: 'currency', label: 'Currency' },
  { key: 'scope', label: 'Scope (comma separated)' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'deliverBy', label: 'Deliver by (YYYY-MM-DD)' },
  { key: 'paymentTerms', label: 'Payment terms' },
];

const DEFAULT_REQUEST = {
  amount: '1250',
  currency: 'AUD',
  scope: 'design, print',
  supplier: 'Northline Supply Co.',
  deliverBy: '2026-12-01',
  paymentTerms: 'Net 30',
};

const state = { request: { ...DEFAULT_REQUEST }, approval: null, result: null, busy: false };

const el = {
  status: document.getElementById('status'),
  form: document.getElementById('form'),
  approve: document.getElementById('approve'),
  msg: document.getElementById('msg'),
};

function renderForm() {
  el.form.innerHTML = '';
  for (const field of FIELDS) {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const label = document.createElement('label');
    label.textContent = field.label;
    label.htmlFor = `f-${field.key}`;
    const input = document.createElement('input');
    input.id = `f-${field.key}`;
    input.value = state.request[field.key] ?? '';
    input.addEventListener('input', (e) => {
      state.request[field.key] = e.target.value;
      recompute();
      scheduleRequestSave();
    });
    wrap.append(label, input);
    el.form.appendChild(wrap);
  }
}

function fmt(value) {
  if (value === null || value === undefined) return '(none)';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function renderStatus() {
  if (!state.result) {
    el.status.className = 'status empty';
    el.status.innerHTML = '<h2>No approval recorded yet</h2><p>Set the facts below, then approve them once.</p>';
    return;
  }
  if (state.result.valid) {
    el.status.className = 'status';
    el.status.innerHTML = `<h2>Approval still matches</h2><p>Approved by ${state.approval.approver} at ${String(state.approval.approvedAt).slice(0, 16).replace('T', ' ')}. Nothing material has changed since.</p>`;
    return;
  }
  const items = state.result.changes
    .map((c) => `<li><strong>${c.label}</strong>: ${fmt(c.before)} &rarr; ${fmt(c.after)} (${c.severity})</li>`)
    .join('');
  el.status.className = 'status stale';
  el.status.innerHTML = `<h2>Stale: ${state.result.headline}</h2><ul>${items}</ul><p>Re-approve the values below, or put the request back to what was approved.</p>`;
}

// The drift verdict is computed here, in the browser, from the same pure module the
// resolver uses. That keeps typing instant and makes the verdict independent of
// storage read latency; the backend still owns the durable record.
function recompute() {
  state.result = state.approval
    ? evaluate(state.approval, snapshot(state.request))
    : null;
  renderStatus();
}

async function loadApproval() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const out = await invoke('getState');
    if (out && (out.approval || out.currentRequest)) {
      state.approval = out.approval || null;
      if (out.currentRequest) {
        state.request = { ...state.request, ...out.currentRequest };
        renderForm();
      }
      recompute();
      return;
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
  }
  recompute();
}

// Typing must not cost a round trip per keystroke, but the page should remember what was typed.
// One debounced write per pause is enough: the approval is the durable record, this is the draft.
let saveTimer = null;
function scheduleRequestSave() {
  if (!state.hydrated) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    invoke('saveRequest', { request: state.request }).catch(() => {});
  }, 900);
}

async function approve() {
  state.busy = true;
  el.approve.disabled = true;
  el.msg.textContent = 'Saving approval…';
  try {
    const out = await invoke('approve', { request: state.request });
    state.approval = out.approval;
    recompute();
    el.msg.textContent = out.persisted
      ? `Approved and saved (page ${out.contentId}).`
      : `Write rejected: HTTP ${out.writeStatus} — ${String(out.writeBody).slice(0, 120)}`;
  } catch (e) {
    el.msg.textContent = `Failed: ${String(e)}`;
  } finally {
    state.busy = false;
    el.approve.disabled = false;
  }
}

el.approve.addEventListener('click', approve);
renderForm();
// The button must be usable even if the stored approval cannot be read back.
el.approve.disabled = false;
// Nothing may write the request back until the stored one has been read. Otherwise the first
// keystroke - or the default values rendered before the read resolves - overwrites what the page
// remembered with the built-in demo numbers.
state.hydrated = false;
loadApproval()
  .then(() => { state.hydrated = true; })
  .catch((e) => {
    state.hydrated = true;
    el.status.className = 'status stale';
    el.status.innerHTML = `<h2>Could not reach the app backend</h2><p>${String(e)}</p>`;
  el.approve.disabled = false;
});
