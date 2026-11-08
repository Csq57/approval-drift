## Inspiration

Every approval is a decision about one exact set of facts: an amount, a scope, a supplier, a delivery
date, payment terms. Someone approves *those values*. Then the page keeps being edited — a number is
nudged, a line item swapped, the date slips — and the approval badge stays exactly where it was,
because nobody re-reads an approval that already looks finished.

By the time finance notices, the thing being paid for is not the thing that was approved. That gap is
the whole product.

## What it does

A macro on a Confluence page holds the request. Press **Approve these exact values** and the app stores
a snapshot of those facts *on that page*, plus who approved and when.

From then on every edit is compared against that snapshot as you type:

- unchanged → **Approval still matches**, with the approval time
- changed → **Stale: amount increase since approval**, listing the exact change and its severity:
  `Amount: 1600 → 1850 (critical)`

Nothing is silently re-approved. A human either re-approves the new values (a new snapshot) or puts
the request back to what was approved. The record survives a reload because it lives in the page
itself.

## How we built it

- **Forge Custom UI macro** — plain HTML/CSS/JS bundled with esbuild. We started with UI Kit and it
  never rendered reliably in this environment; Custom UI worked first time. Styling is an external
  stylesheet because the app iframe's CSP blocks inline `<style>`.
- **Verdict logic** (`src/approval.js`) — normalise a request into a snapshot, diff two snapshots,
  decide validity, emit reason codes. Pure functions, no network, no model.
- **Storage** — the approval is a Confluence **content property** on the page, written through the v2
  REST API (`/wiki/api/v2/pages/{id}/properties`). The v1 content-property endpoint returns `410 Gone`
  today, and Forge KVS accepted writes but returned nothing on read. Page property was the only path
  that actually persisted.
- **Where the verdict runs** — in the browser, from the same module the resolver uses, so typing is
  instant and does not wait on a round trip. The server owns the durable record, not the opinion.

## Challenges we ran into

- Forge KVS: `set` resolved, `get` returned nothing, and the value was gone on reload. Hours went into
  chasing that before switching to page properties.
- The v1 REST content-property endpoint returns `410`; v2 only accepts **published** page ids, so a
  draft page fails with `404 Could not find page with id`.
- UI Kit 1 is deprecated; UI Kit 2 (`render: native`) showed a permanent spinner here. Custom UI was
  the fix.
- Inline `<style>` is blocked by CSP — the page rendered unstyled until the CSS moved to its own file.
- Updating an existing content property requires `version.number = previous + 1`, or the write is
  rejected.

## Accomplishments that we're proud of

- An approval that reports its own invalidity, with the exact field, direction and severity — and a
  record that survives a page reload.
- 10 tests pinning the cases that matter: formatting noise must not invalidate anything (`A$1,250.00`
  and `1250` are the same fact), a raised amount must, a currency switch is critical even when the
  number is untouched, a shrunk scope reads `reduced` not `changed`, and a deleted field counts as
  `removed`.
- Eligible for **Runs on Atlassian**: no external egress, no analytics, no personal data.

## What we learned

An approval is not a status, it is a **claim with an expiry that nobody tracks**. The useful object is
not the request, it is the validity of a past decision — and that is checkable with deterministic
code, which is exactly why it should not be left to a model's judgement.

## What's next for Approval drift

- Approval history per page: who approved what, when it went stale, who re-approved.
- Approver identity from Confluence rather than a label.
- A space-level view of every page whose approval has drifted.
- Optional notification when a page with a stale approval is exported or used in a decision.

## Rovo Agent

The app also ships a Rovo Agent, **Approval drift auditor**, so the question can be asked in
conversation instead of on the page. It has one action, `get-approval-record`, which reads the
approval stored on a page and returns the exact values that were approved, who approved them and
when. The agent is explicitly told not to declare an approval valid on its own authority: it can
report what was approved and when, and the verdict stays with the deterministic logic in the macro.
Try: *"What was this page approved against?"* or *"Does this page still have a usable approval?"*