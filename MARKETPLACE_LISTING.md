# Marketplace 送审 · 填写材料（一次备好，登录后照着贴）

## 现状

| 项 | 值 |
|---|---|
| 原应用（给评委装，**不动**） | `78531246-77fd-4df3-b3e6-981bd449e3d9`，始终 Sharing，安装链接有效 |
| 副本应用（**拿去送审**） | `cb87d8c6-a02f-4a6c-a22a-aaefefde5d74`，v2.0.0 已部署 production，符合 Runs on Atlassian |
| 副本目录 | `C:\Users\Chan\Documents\codegeist2026\forge-app-listing`（已 gitignore） |

**为什么必须用副本**：Atlassian 官方文档写明——一旦提交 Marketplace 上架，该应用**不能再通过安装链接分发**。
原应用是 Devpost 里给评委的安装入口，不能冒这个险。

## 需要你做的唯一一步

浏览器登录 Atlassian 开发者控制台（密码 / 可能 2FA）：

1. **给副本开共享**：<https://developer.atlassian.com/console/myapps/> → 选 `Approval drift`（app id 尾号 `cb87d8c6`）→ 左侧 **Distribution** → Edit → 选 **Sharing** → 保存 → 复制安装链接
2. **发布 Developer Space 上架**：同一控制台 → 左边 **Developer space** → Publish to Marketplace

登录后把控制台页面停在那个应用上，剩下的表单我用你确认过的文案贴完。

## Listing 各字段（可直接复制）

### App name
```
Approval drift
```

### Summary（≤80 字符）
```
Knows when an approval no longer matches the page it was approved on.
```

### Description
```
An approval is a decision about one exact set of facts: an amount, a scope, a supplier, a delivery date. Someone approves those values. Then the page changes — and the approval quietly keeps asserting something that is no longer true. Nobody re-reads an approval that already looks finished.

Approval drift is a Confluence macro that treats an approval as a claim about specific facts, and checks that claim every time the page renders.

How it works
• Insert the macro and fill in the request: amount, currency, scope, supplier, delivery date, payment terms.
• Press "Approve these exact values". The approved snapshot is stored as a content property on that page, so it belongs to the page rather than to a browser session.
• Change any value. The panel turns red immediately and names the field and the direction: "Stale: amount increase since approval — Amount: 1600 → 1850 (critical)".
• Approve again to store a new snapshot.

Why the verdict can be trusted
The comparison is a pure function: normalise the request into a snapshot, diff it against the approved snapshot, decide. No model, no heuristics, no network call. Formatting noise does not invalidate anything (A$1,250.00 and 1250 are the same fact); a raised amount does; a currency switch is critical even when the number is untouched; a deleted field is reported as removed rather than ignored.

Works with Rovo
The app ships a Rovo agent, "Approval drift auditor". Ask it what a page was approved against and it answers with the exact approved values, who approved them and when — then tells you to compare them with the page now. It deliberately does not rule on whether the approval still holds: that verdict stays with the deterministic check.

Privacy
No external services, no analytics, no personal data. Everything stays inside Confluence: the approval is a page property, and the comparison happens in the browser.

Runs on Atlassian eligible. MIT licensed. Source: https://github.com/Csq57/approval-drift
```

### Category
```
Confluence
```

### Pricing model
```
Free
```

### Support / docs URLs
```
Support: https://github.com/Csq57/approval-drift/issues
Documentation: https://github.com/Csq57/approval-drift#readme
Privacy policy: https://github.com/Csq57/approval-drift/blob/main/PRIVACY.md
End user terms: https://github.com/Csq57/approval-drift/blob/main/TERMS.md
```

### 截图（按顺序上传）
1. `C:\Users\Chan\Documents\codegeist2026\shots\gallery-1-valid.png` —— 批准后为绿：Approval still matches
2. `C:\Users\Chan\Documents\codegeist2026\shots\gallery-2-stale.png` —— 改值后变红：Stale, 1600 → 1850 critical

### 审核会问的两个问题（预答）
**为什么需要这些 scope？**
- `read:page:confluence` / `read:content-details:confluence` —— 读取当前页面的 request 值，用于与已批准快照比对
- `read:content.property:confluence` / `write:content.property:confluence` —— 把批准快照存为页面属性，并在批准时写入
- `write:page:confluence` —— 宏在页面上的渲染上下文需要

**是否有外部主机请求？**
无。应用不发起任何 external fetch，无 egress 权限。

## 送审后

1. 把 **review ticket 链接**（或 listing 链接）发我
2. 我把它填进 Devpost 的「bonus: Best Marketplace published app」材料里，重新提交
3. 原应用的安装链接**不受影响**，评委路径不变

## 时间

官方口径：提交后约 1 周出决定。Codegeist 12/23 截止，来得及。**不需要等审核通过**——规则写明「已上架或已提交审核」二选一即可。
