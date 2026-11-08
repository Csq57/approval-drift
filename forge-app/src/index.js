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
    return { approval: await readApproval(contentId), contentId };
  } catch (e) {
    return { approval: null, error: String(e), contentId };
  }
});

resolver.define('approve', async (req) => {
  const contentId = contentIdOf(req);
  const request = req?.payload?.request ?? {};
  if (!contentId) return { error: 'no content context' };
  const record = {
    approvedSnapshot: snapshot(request),
    approver: 'page editor',
    approvedAt: new Date().toISOString(),
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
