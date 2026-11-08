# Privacy policy — Approval drift

Last updated: 2026-11-08

## What this app stores

Approval drift stores exactly one record per page where the macro is used: the **approval
snapshot**. That record contains:

- the six request fields shown in the macro (amount, currency, scope, supplier, delivery date,
  payment terms),
- a short approver label (`page editor`),
- the timestamp of the approval.

It is written as a **Confluence content property** on that page, using the Confluence REST API.
It stays inside your Atlassian site.

## What this app does not do

- It does not collect names, email addresses, account IDs, or any other personal data.
- It does not send data to any server outside Atlassian. The app is eligible for the
  **Runs on Atlassian** program: its functions run on Atlassian infrastructure and it makes no
  external network calls.
- It does not use analytics or tracking.
- It does not read pages other than the one the macro is placed on.

## Data retention and deletion

The record lives and dies with the page: deleting the page removes it. Uninstalling the app leaves
the content property in place; an administrator can remove it with the Confluence REST API
(`DELETE /wiki/api/v2/pages/{id}/properties/{propertyId}`).

## Contact

0814chensongquan@gmail.com
