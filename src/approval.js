/**
 * Approval drift: an approval is granted against one snapshot of a request.
 * The request then changes. Nobody re-reads the approval.
 *
 * This module is the part that must never be probabilistic: it decides, from two snapshots,
 * whether the approval still covers what is on the page now. It has no Forge, no network and
 * no model in it, so the answer can be re-computed by anyone and tested in isolation.
 */

/**
 * Fields whose change invalidates an approval, ordered by how badly they break the original
 * decision. Money is stored in ONE unit only - major units with two decimals - so that
 * "$1,250.00" and 1250 are the same fact.
 */
export const MATERIAL_FIELDS = [
  { key: 'amount', label: 'Amount', kind: 'money', severity: 'critical' },
  { key: 'currency', label: 'Currency', kind: 'text', severity: 'critical' },
  { key: 'scope', label: 'Scope', kind: 'list', severity: 'critical' },
  { key: 'supplier', label: 'Supplier', kind: 'text', severity: 'high' },
  { key: 'deliverBy', label: 'Delivery date', kind: 'date', severity: 'medium' },
  { key: 'paymentTerms', label: 'Payment terms', kind: 'text', severity: 'medium' },
];

const SEVERITY_RANK = { critical: 3, high: 2, medium: 1, low: 0 };

function normalise(field, value) {
  if (value === null || value === undefined) return null;
  if (field.kind === 'money') {
    const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(num) ? Math.round(num * 100) / 100 : null;
  }
  if (field.kind === 'list') {
    const list = Array.isArray(value) ? value : String(value).split(/[,;\n]/);
    return list.map((v) => String(v).trim().toLowerCase()).filter(Boolean).sort();
  }
  if (field.kind === 'date') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value).trim() : d.toISOString().slice(0, 10);
  }
  return String(value).trim().toLowerCase();
}

/** Snapshot the fields an approval is granted against. */
export function snapshot(request) {
  const out = {};
  for (const field of MATERIAL_FIELDS) {
    out[field.key] = normalise(field, request[field.key]);
  }
  return out;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Compare two snapshots and return only the material differences.
 * Returns [] when nothing that matters has moved.
 */
export function diffSnapshots(approved, current) {
  const changes = [];
  for (const field of MATERIAL_FIELDS) {
    const before = approved[field.key];
    const after = current[field.key];
    if (same(before, after)) continue;
    changes.push({
      key: field.key,
      label: field.label,
      severity: field.severity,
      before,
      after,
      direction: directionOf(before, after),
    });
  }
  return changes;
}

function directionOf(before, after) {
  if (before === null || before === undefined) return 'added';
  if (after === null || after === undefined) return 'removed';
  if (typeof before === 'number' && typeof after === 'number') {
    return after > before ? 'increase' : 'decrease';
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    return after.length > before.length ? 'expanded' : 'reduced';
  }
  return 'changed';
}

/**
 * The decision. An approval stays valid only while every material field it was granted
 * against is unchanged.
 *
 * @param {{approvedSnapshot: object, approver?: string, approvedAt?: string}} approval
 * @param {object} currentSnapshot
 */
export function evaluate(approval, currentSnapshot) {
  const changes = diffSnapshots(approval.approvedSnapshot, currentSnapshot);
  if (changes.length === 0) {
    return { valid: true, changes: [], worst: null, headline: 'approval still matches' };
  }
  const worst = changes.reduce(
    (acc, c) => (SEVERITY_RANK[c.severity] > SEVERITY_RANK[acc.severity] ? c : acc),
    changes[0],
  );
  return { valid: false, changes, worst, headline: headlineFor(changes, worst) };
}

function headlineFor(changes, worst) {
  const parts = changes.map((c) => `${c.label.toLowerCase()} ${c.direction}`);
  const who = worst.severity === 'critical' ? 'needs a new approval' : 'should be re-confirmed';
  return `${parts.join(', ')} since approval - ${who}`;
}

/** Machine-readable reason codes, for automation and for the audit trail. */
export function reasonCodes(changes) {
  return changes.map((c) => `${c.key}:${c.direction}`);
}
