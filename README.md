# Approval drift

A Confluence app that answers one question:

> **This was approved three weeks ago. Is the approval still about the same thing?**

## The problem

An approval is a decision about one exact set of facts: an amount, a scope, a supplier, a date,
payment terms. Someone approves that. Then the page changes — a number is nudged, a line item is
swapped, the delivery date slips — and the approval badge stays exactly where it was. Nobody
re-reads an approval that already looks done.

By the time finance notices, the thing being paid for is not the thing that was approved.

## What this app does

1. A page carries a request. The macro on the page holds the facts that matter.
2. Someone presses **Approve these exact values**. The app stores a snapshot of those facts on
   that page as a Confluence content property, together with who approved and when.
3. Every later edit to the facts is compared against that snapshot, in the browser, as you type.
4. If a material field moved, the approval is shown as **stale**, with the exact change and which
   way it moved: `Amount: 1250 → 1600 (critical)`.
5. Nothing is silently re-approved. A human either re-approves the new values, or puts the request
   back to what was approved.

## Why the decision is not made by a model

The interesting object here is not the request, it is **the validity of a decision over time**.
That is a claim you can check, so it is checked with deterministic code:

- `src/approval.js` — normalise a request into a snapshot, diff two snapshots, decide validity,
  emit reason codes. No network, no model, no Forge API.
- `src/approval.test.js` — 10 tests covering the cases that actually matter: formatting noise must
  not invalidate anything (`A$1,250.00` vs `1250`), a raised amount must, a currency switch is
  critical even when the number is untouched, scope shrink is reported as `reduced` rather than
  `changed`, and a deleted field counts as `removed`.

```
node --test src/approval.test.js
```

## Architecture

| Piece | Choice | Why |
|---|---|---|
| Module | `confluence:macro` (Custom UI) | The approval lives on the page it approves. UI Kit did not render reliably in this environment; Custom UI is plain HTML/JS and does. |
| Verdict | computed in the browser, from `src/approval.js` | Typing must be instant and must not depend on a round trip. |
| Storage | Confluence page property, key `approvalDrift` | The v1 REST endpoint returns `410 Gone`; v2 `/wiki/api/v2/pages/{id}/properties` is the supported path. Forge KVS accepted writes and returned nothing on read. |
| Styling | external `app.css` | Inline `<style>` is blocked by the app iframe's CSP. |

## Repository layout

```
manifest.yml              Forge manifest (macro + resolver, page property scopes)
static-v2/index.html      Custom UI shell
static-v2/app.css         styles (external, CSP-safe)
static-v2/main.js         bundled frontend (esbuild output)
src/index.js              resolver: read/write the page property, evaluate the verdict
src/approval.js           the deterministic decision logic
src/approval.test.js      10 tests
src/frontend/main.js      frontend source (bundled into static-v2/main.js)
```

## Build and deploy

```
npm install
npx esbuild src/frontend/main.js --bundle --format=iife --outfile=static-v2/main.js
forge deploy -e production
forge install --upgrade -e production --site <your-site> --product Confluence --confirm-scopes
```

Then, on any Confluence page, type `/Approval drift` and insert the macro.

## Install (for reviewers)

1. Open the installation link for this app and sign in to Atlassian.
   The link is on the app's Devpost listing; it is a signed Atlassian install URL that redirects
   through `id.atlassian.com` and then lands on the install page for this app.
2. Choose the Confluence site to install onto. Any site where you are an admin will accept it —
   the app is distributed as *Sharing with anyone*, so no vendor account is needed.
3. Open any Confluence page, press **Edit**, type `/Approval drift` and insert the **Approval drift**
   macro, then **Publish**.

What you should see: a panel holding the six request fields. Press **Approve these exact values** —
it turns green ("Approval still matches") and a message reads *Approved and saved*. Change the
amount, and the panel turns red immediately: *Stale: amount increase since approval*, with
`Amount: 1600 → 1850 (critical)`. Reload the page: both the values and the approval survive, because
they are stored as a content property on that page.

Requires a Confluence Cloud site where you can install apps. If the link has expired, it can be
regenerated from the app's distribution page in the Atlassian developer console.

## Privacy

The app stores one thing: the approval snapshot (the six request fields, an approver label, and a
timestamp) as a content property on the page where the macro is used. It stores no personal data,
sends nothing to any external service, and has no analytics. It is eligible for the
**Runs on Atlassian** program, which means it runs entirely on Atlassian infrastructure.

Full text: [PRIVACY.md](PRIVACY.md).

## Terms

Provided under the MIT License, as is, without warranty. It records the values you approve and
flags when those values change; it does not approve, authorise, or block anything by itself.

Full text: [TERMS.md](TERMS.md).

## License

MIT — see [LICENSE](LICENSE).
