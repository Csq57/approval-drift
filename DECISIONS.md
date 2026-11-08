# DECISIONS

每条记录：日期 / 问题 / 结论 / 我的独立意见 / 推翻条件。
规则见 `C:\Users\Chan\.dsh\AGENTS.md`：同一问题不重复问外部模型，先读这里。

---

## 2026-11-08 · Kiroween 出局后，未来 8 周押哪个目标

**问题**：NFL Big Data Bowl（$100k，截至 2027-01-06）/ UGREEN（$46k，8 天）/ Meta VR（$1M，10 天）/ Name That LLM（$50k，2 个月）/ 不押新的、打磨已提交作品 —— 选一个。

**外部模型结论（gpt-6.1-sol / high，55.7s）**：选「不押新的」。
- 理由：已有 80–120 小时，用在现成作品上更适合验证真实需求、积累客户证据；奖金规模不等于投入优先级。
- 淘汰理由：NFL 的 PASS 只是门槛，领域理解与有价值的解释是短板；UGREEN 8 天不够补硬件场景；Meta VR 的 START 会员状态不明；Name That LLM 的资格与算力成本未核实。
- 8 周计划：W1 找 5 名目标用户试用并记录卡点 → W2–3 只修被反复卡住的那条流程 → W4–6 让 3 人连续试用两周，争取 2 人主动复用 → W7–8 有复用才准备上架材料（Marketplace 需审核，留出时间）；无复用就停止产品化，把成果整理成可演示案例。
- 它指出的最大风险：**把奖金规模当成投入优先级**；建议硬约束「8 周内不因新奖金池切换目标」。

**我的独立意见（有分歧，记录在案）**：我原本推荐 NFL Big Data Bowl，理由是资格干净、竞争密度低（533 队 / $100k）、不需要 GPU、交付物是 notebook + 写作可直接进作品集。外部模型的反对点成立但被高估——它说「领域理解是短板」，可是该赛评审是方案与表达的清晰度，不是橄榄球知识考试，8 周足够建立最小必要领域词汇。
真正让我接受它结论的是另一条它没强调的理由：**这两个已提交作品一条反馈都还没拿到**（PayPal 12 月出结果、Codegeist 1 月出结果），此时再开第三条战线，等于在没有任何信号的情况下重复投入同一种能力。先让已有作品接触真实用户，信息价值更高。

**结论**：接受「不押新的」。8 周内不因新奖金池切换目标；每周一 09:00 的扫描照常跑，但只作信息记录，除非出现「资格合格 + 单人可做 + 剩余时间 ≥ 6 周 + 奖金 ≥ $50k」的强信号，否则不启动新项目。

**推翻条件**（任一成立即重开此议题）：
1. Codegeist 或 PayPal 出结果，且未获奖 —— 说明「完成度」而非「数量」是瓶颈，届时优先复盘而不是换赛道。
2. 8 周内 5 名试用者中无人复用（< 2 人主动重复使用）—— 按计划停止产品化。
3. 出现奖金 ≥ $50k、资格明确含澳、且与数据清洗/自动化直接相关的线上比赛 —— 可重新评估是否并行。

---

## 2026-11-08 22:35 · Rovo action 端到端已验证

**做法**：Rovo 面板用 Chrome side-panel 表面渲染，CDP 的 page/frame 都看不到；改用桌面辅助功能树读取，拿到了完整对话。

**证据**（Rovo 里问 "What was this page approved against?" 的实际回答）：列出 `Amount: 1850`、`Currency: AUD`、
`Scope: design, print`、`Supplier: northline supply co.`、`Deliver by: 2026-12-01`、`Payment terms: net 30`、
`Approved by: Page editor`、`Approved on: 2026-11-08 at 08:22 UTC`、`Recency: approximately 3 hours ago`，
并以 "you must compare these values against the current content of the page" 收尾。

**结论**：action 被真实调用；返回的是页面属性真值；agent 遵守 prompt 约束，没有自行判定有效性。

**顺带修掉的竞态**：前端在 `getState` 返回前就允许 `saveRequest`，慢加载时默认值会覆盖页面记忆。
加 `state.hydrated` 闸门后，实测「加载 1850 → 刷新 1850 → 4 秒后仍 1850」。部署 v6.5.0。

**提交材料**：Devpost 故事改为已验证表述，重新提交后仍 Submitted 5/5。

**又一个踩过的坑**：用 .NET `AppendAllText` 配相对路径时，写到了进程 CWD（paypal 项目），导致 Rovo 记录被追加进
**PayPal 的公开仓库**，`STATE.md` 也被 `git add -A` 带进去。已清理并加 .gitignore。以后跨项目写文件一律用绝对路径。