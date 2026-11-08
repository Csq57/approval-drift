import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

import { snapshot, evaluate } from './approval';

const resolver = new Resolver();
const PROP_KEY = 'approvalDrift';

function contentIdOf(req) {
  return req?.context?.extension?.content?.id ?? null;
}

function jsonHeaders() {
  return { 'Content-Type': 'application/json', Accept: 'application/json' };
}

async function listProperties(contentId) {
  const res = await api.asApp().requestConfluence(
    route`/wiki/api/v2/pages/${contentId}/properties`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) {
    return { ok: false, status: res.status, body: (await res.text()).slice(0, 300), results: [] };
  }
  const body = await res.json();
  return { ok: true, status: res.status, results: body?.results ?? [] };
}

async function readApproval(contentId) {
  const listed = await listProperties(contentId);
  if (!listed.ok) throw new Error(`list properties failed: ${listed.status} ${listed.body}`);
  const hit = listed.results.find((p) => p.key === PROP_KEY);
  return hit ? hit.value : null;
}

async function writeApproval(contentId, record) {
  const listed = await listProperties(contentId);
  if (!listed.ok) {
    return { ok: false, status: listed.status, body: listed.body };
  }
  const hit = listed.results.find((p) => p.key === PROP_KEY);
  if (hit) {
    const res = await api.asApp().requestConfluence(
      route`/wiki/api/v2/pages/${contentId}/properties/${hit.id}`,
      {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify({
          key: PROP_KEY,
          value: record,
          version: { number: (hit.version?.number ?? 1) + 1 },
        }),
      },
    );
    return { ok: res.ok, status: res.status, body: (await res.text()).slice(0, 300) };
  }
  const res = await api.asApp().requestConfluence(
    route`/wiki/api/v2/pages/${contentId}/properties`,
    { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ key: PROP_KEY, value: record }) },
  );
  return { ok: res.ok, status: res.status, body: (await res.text()).slice(0, 300) };
}

resolver.define('getState', async (req) => {
  const contentId = contentIdOf(req);
  if (!contentId) return { approval: null, error: 'no content context' };
  try {
    const record = await readApproval(contentId);
    return {
      approval: record,
      // The request itself is part of the page, not just the approval. Without this the macro
      // would fall back to its built-in demo values on every reload and immediately look stale
      // against an approval for different numbers — which reads as a bug, not as drift.
      currentRequest: record?.currentRequest ?? null,
      contentId,
    };
  } catch (e) {
    return { approval: null, error: String(e), contentId };
  }
});

resolver.define('saveRequest', async (req) => {
  const contentId = contentIdOf(req);
  const request = req?.payload?.request ?? {};
  if (!contentId) return { ok: false, error: 'no content context' };
  const existing = await readApproval(contentId).catch(() => null);
  const record = {
    ...(existing || {}),
    currentRequest: request,
  };
  const write = await writeApproval(contentId, record);
  return { ok: write.ok, status: write.status };
});

resolver.define('approve', async (req) => {
  const contentId = contentIdOf(req);
  const request = req?.payload?.request ?? {};
  if (!contentId) return { error: 'no content context' };
  const record = {
    approvedSnapshot: snapshot(request),
    approver: 'page editor',
    approvedAt: new Date().toISOString(),
    currentRequest: request,
  };
  const write = await writeApproval(contentId, record);
  return {
    approval: record,
    result: evaluate(record, snapshot(request)),
    persisted: write.ok,
    writeStatus: write.status,
    writeBody: write.body,
    contentId,
  };
});

export const handler = resolver.getDefinitions();

/**
 * Rovo action: hand the agent the approval record for a page.
 *
 * The agent is deliberately not asked to judge validity — it can only report what was
 * approved and when. The verdict stays with the deterministic logic in src/approval.js.
 */
export const getApprovalRecord = async (payload) => {
  const contentId =
    payload?.pageId ||
    payload?.context?.confluence?.contentId ||
    null;

  if (!contentId) {
    return 'No page id was supplied and no Confluence page is in context. Ask the user which page to check, or open the page and ask again.';
  }

  let record = null;
  try {
    record = await readApproval(contentId);
  } catch (e) {
    return `Could not read the approval record for page ${contentId}: ${String(e)}`;
  }

  if (!record || !record.approvedSnapshot) {
    return `Page ${contentId} has no recorded approval. Nothing has been approved there, so there is no decision to re-check. The user can add the Approval drift macro to the page and approve the current values.`;
  }

  const s = record.approvedSnapshot;
  const agreed = [
    `amount ${fmt(s.amount)}`,
    `currency ${fmt(s.currency)}`,
    `scope ${fmt(s.scope)}`,
    `supplier ${fmt(s.supplier)}`,
    `deliver by ${fmt(s.deliverBy)}`,
    `payment terms ${fmt(s.paymentTerms)}`,
  ].join('; ');

  const approvedAt = record.approvedAt || 'an unknown time';
  return [
    `Page ${contentId} was approved against: ${agreed}.`,
    `Approved by ${record.approver || 'an unnamed approver'} at ${approvedAt}.`,
    'To decide whether that approval still applies, compare those values with what the page says now. The macro on the page does that comparison automatically and reports any field that has moved.',
  ].join(' ');
};

function fmt(value) {
  if (value === null || value === undefined) return '(none)';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}
