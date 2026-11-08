# Codegeist 对手研究 · 2026-11-08

限时 60 分钟，目的只有一个：找出「评委三分钟能否看懂」的缺口，能修就修，不能修就记下来。

## 一、2025 年获奖名单（官方公布，不是猜测）

**分类冠军**

| 名次 | 赛道 | 项目 | 一句话 |
|---|---|---|---|
| 🥇 | Software Teams | Secure Notes for Jira | 敏感信息留在 Jira 里，带权限与审计 |
| 🥇 | **Business Teams** | **Frank.** | Jira/Confluence/Rovo 里的 HR 方案，权限感知 |
| 🥇 | Specialized | FleetOps | 车队事故上报，结构化数据 + Atlassian |
| 🥈 | Software | Sherlock Sync | 把代码里的隐性知识变成可查文档 |
| 🥈 | Business | Sidekick4All | 打通 Jira 与日历，看时间与工作如何对齐 |
| 🥉 | Business | File Field Cloud | Jira 里的文件管理 |

**Bonus：Best Rovo Apps（6 个）**：AI Backlog for Jira、FleetOps、**Frank.**、Sidekick4All、Smart Data Generator、YardMaster
**Bonus：Best Runs on Atlassian（6 个）**：Graph Goose、Asset QR Manager、**Immutable Ledger for Jira（可验证审计）**、Manufacturing 3D Visualizer、PitStop、File Field Cloud
**Bonus：Best Rovo Dev（6 个）**：Sync for Confluence、Risk Manager、EpicStory、PitstopX、Rovo Autonomous Team Orchestrator、DevOps Commander

## 二、获奖项目的共同结构（从 Frank. 全文抽取）

1. **定位句点名使用面**："Your People management solution inside **Jira, Confluence, and Rovo**."
2. **明确区分谁用、谁不需要新界面**：HR/经理在 Jira 里用；员工不装新界面，通过 Rovo 提问。
3. **先有用户接触再动手**：写了他们访谈 HR 与 Solution Partner，用访谈结论解释设计。
4. **平台原生**：每个员工是一个 Jira work item → 天然获得权限、工作流、自动化；明确 Runs on Atlassian。
5. **信任模型单独成段**：权限组、敏感数据隔离、AI 必须 grounded 在已批准文档上。
6. **7 张带说明的截图**：People Dashboard / Rovo Agent / Org Chart / Teams / 360 视图 / Onboarding。
7. **可动手的试用入口**：Loom 演示 + Marketplace 链接。

## 三、对照我们的提交：三个缺口

| # | 缺口 | 严重度 | 状态 |
|---|---|---|---|
| 1 | **项目页 0 张截图**（Frank 有 7 张带说明的） | 高 | 图已裁好（`shots/gallery-1-valid.png`、`gallery-2-stale.png`），上传被 Devpost 自定义上传组件挡住，需在页面上拖拽一次 |
| 2 | 定位句没点名 Confluence + Rovo | 中 | **已修**，改为 "Approval drift for Confluence and Rovo: ..." |
| 3 | 故事缺「谁用 / 谁不需要新界面」 | 中 | **已修**，新增 `## Who it is for` 段 |

已重新提交，仍 **Submitted 5/5**（故事 5,331 字符）。

## 四、我们的差异化（据实）

- 2025 的 **Immutable Ledger for Jira** 做的是「不可篡改的审计记录」——记录**发生了什么**。
- 我们做的是「这个审批是否还成立」——判断**一个过去的决定是否仍然适用**。这两件事不重叠：账本可以完整无缺，而审批依然早已失效。
- 与 Frank. 的火腿腿差别：他们是团队规模（7 人，含产品/设计/市场），我们是单人 + 确定性逻辑 + 可离线跑的 10 条测试。**不要在团队规模上比，要在「判断是否可信、能不能复算」上比。**

## 五、下一步（只做清单里的，不扩散）

1. 补 2 张带说明的截图到 Devpost 项目页（唯一剩余的高价值动作）。
2. 不做：照搬对手功能、因别人团队大而转向、无限刷项目页。
