import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluate, snapshot, diffSnapshots, reasonCodes } from './approval.js';

const order = {
  amount: 1250.0,
  currency: 'AUD',
  scope: ['design', 'print'],
  supplier: 'Northline Supply Co.',
  deliverBy: '2026-12-01',
  paymentTerms: 'Net 30',
};

const approval = {
  approver: 'finance-approver',
  approvedAt: '2026-11-01T10:00:00Z',
  approvedSnapshot: snapshot(order),
};

test('an unchanged request keeps the approval valid', () => {
  const result = evaluate(approval, snapshot({ ...order }));
  assert.equal(result.valid, true);
  assert.deepEqual(result.changes, []);
});

test('formatting differences alone do not invalidate anything', () => {
  const sameFacts = {
    amount: 'A$1,250.00',
    currency: 'aud',
    scope: 'Design; PRINT',
    supplier: '  northline supply co. ',
    deliverBy: '2026-12-01T00:00:00Z',
    paymentTerms: 'net 30',
  };
  const result = evaluate(approval, snapshot(sameFacts));
  assert.equal(result.valid, true, JSON.stringify(result.changes));
});

test('raising the amount invalidates the approval and says which way it moved', () => {
  const result = evaluate(approval, snapshot({ ...order, amount: 1490.0 }));
  assert.equal(result.valid, false);
  assert.equal(result.worst.key, 'amount');
  assert.equal(result.worst.direction, 'increase');
  assert.match(result.headline, /amount increase/);
  assert.match(result.headline, /new approval/);
});

test('a new currency is critical even when the number is untouched', () => {
  const result = evaluate(approval, snapshot({ ...order, currency: 'USD' }));
  assert.equal(result.valid, false);
  assert.equal(result.worst.severity, 'critical');
  assert.deepEqual(reasonCodes(result.changes), ['currency:changed']);
});

test('scope drift is reported as reduced or expanded, not just changed', () => {
  const reduced = evaluate(approval, snapshot({ ...order, scope: ['design'] }));
  assert.equal(reduced.worst.direction, 'reduced');
  const expanded = evaluate(approval, snapshot({ ...order, scope: ['design', 'print', 'install'] }));
  assert.equal(expanded.worst.direction, 'expanded');
});

test('swapping the supplier is high severity, not silent', () => {
  const result = evaluate(approval, snapshot({ ...order, supplier: 'Someone Else Ltd' }));
  assert.equal(result.valid, false);
  assert.equal(result.worst.severity, 'high');
  assert.match(result.headline, /re-confirmed/);
});

test('a later delivery date alone is medium severity but still invalidates', () => {
  const result = evaluate(approval, snapshot({ ...order, deliverBy: '2026-12-15' }));
  assert.equal(result.valid, false);
  assert.equal(result.worst.severity, 'medium');
});

test('several changes at once report the worst one as the headline', () => {
  const result = evaluate(approval, snapshot({ ...order, amount: 2000.0, deliverBy: '2027-01-10' }));
  assert.equal(result.valid, false);
  assert.equal(result.changes.length, 2);
  assert.equal(result.worst.key, 'amount');
});

test('a field missing from the new request counts as removed', () => {
  const withoutTerms = { ...order };
  delete withoutTerms.paymentTerms;
  const result = evaluate(approval, snapshot(withoutTerms));
  assert.equal(result.valid, false);
  assert.equal(result.changes[0].direction, 'removed');
});

test('diff is stable: identical snapshots never produce a change', () => {
  const a = snapshot(order);
  const b = snapshot({ ...order });
  assert.deepEqual(diffSnapshots(a, b), []);
});
