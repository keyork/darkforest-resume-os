# darkforest-resume-os: 可计算、可匹配、可优化的智能简历 Agent 系统

## 项目愿景

在 AI 时代，简历不应该是静态文档，而应该是一个**可计算、可匹配、可优化的 Agent 系统**。darkforest-resume-os 将个人职业经历解构为结构化的、可独立管理的 Item，通过 AI Agent 实现与 JD 的语义级匹配，并能动态生成针对性简历。

---

## 技术栈

- **语言**: TypeScript (全栈)
- **运行时**: Node.js >= 20
- **框架**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS + shadcn/ui
- **AI 引擎**: OPENAI API (`glm5`)
- **数据存储**: SQLite (via better-sqlite3)，后续可迁移 PostgreSQL
- **ORM**: Drizzle ORM
- **包管理**: pnpm
- **数据可视化**: Recharts
- **Markdown 渲染**: react-markdown
- **ID 生成**: nanoid

---

## 核心概念：一切皆 Item

系统的基础设计哲学是**一切皆 Item**。用户的每一条履历、每一个技能点、每一段教育经历、每一个项目，都是一个**独立的、可编辑、可显隐、可排序的 Item**。

### Item 通用属性

每个 Item 无论类型，都具备以下通用能力：

- **可编辑**: 用户可以随时修改任何字段
- **可显隐**: 用户可以将某个 Item 设为"隐藏"，隐藏的 Item 不参与匹配分析和简历生成，但数据保留，随时可恢复
- **可排序**: 用户可以拖拽调整同类 Item 的顺序
- **有来源标记**: 标记该 Item 是用户手动创建、还是从上传简历中 AI 解析得来的（AI 解析的 Item 带有"AI 生成"标签，用户确认/编辑后标签消失）

### Item 类型

系统中共有 5 种 Item 类型：

#### 1. 技能 Item (Skill)

字段：

- 技能名称（如 "React", "项目管理", "数据分析"）
- 技能分类（编程语言 / 框架 / 工具 / 方法论 / 软技能 / 领域知识 / 管理 / 设计 / 数据 / DevOps / 其他）
- 熟练度（1-5 星：了解 / 熟悉 / 熟练 / 精通 / 专家）
- 使用年限
- 最近使用时间
- 关联关键词（同义词和变体，如 JS / JavaScript / ECMAScript，用于匹配时扩大召回）
- 备注（可选的自由文本）

#### 2. 工作经历 Item (Experience)

字段：

- 公司名称
- 职位头衔
- 开始时间 — 结束时间（或"至今"）
- 工作地点（可选）
- 职责描述（一段话概述）
- 核心成果列表（每条成果是一个子项，支持量化指标）
- 关联技能（从技能 Item 中选择关联）
- 行业标签

#### 3. 项目 Item (Project)

字段：

- 项目名称
- 担任角色
- 项目描述
- 技术栈标签
- 核心成果列表（同上）
- 关联技能
- 项目链接（可选）
- 开始时间 — 结束时间

#### 4. 教育 Item (Education)

字段：

- 学校名称
- 学位
- 专业
- 开始时间 — 结束时间
- GPA（可选）
- 亮点列表（如荣誉、奖学金、重要课程）

#### 5. 证书 Item (Certification)

字段：

- 证书名称
- 颁发机构
- 获得日期
- 过期日期（可选）
- 证书编号（可选）
- 关联技能

---

## 数据模型设计

### 数据库表结构（Drizzle ORM + SQLite）

**profiles 表**：用户档案元信息

- id, name, title（当前职位头衔）, summary（职业摘要）, contact（JSON: email/phone/location/website/linkedin）, created_at, updated_at

**items 表**：所有 Item 的统一存储

- id
- profile_id → profiles.id
- type: 'skill' | 'experience' | 'project' | 'education' | 'certification'
- data: JSON（根据 type 不同，存储对应的字段结构）
- visible: boolean（默认 true，用户可切换隐藏）
- sort_order: integer（同 type 内的排序权重）
- source: 'manual' | 'ai_parsed' | 'ai_confirmed'（来源标记）
- created_at, updated_at

**job_descriptions 表**：JD 存储

- id, raw_text, parsed: JSON（解析后的结构化数据）, created_at

**match_results 表**：匹配结果

- id, profile_id, jd_id, result: JSON, overall_score: real, created_at

**generated_resumes 表**：生成的简历

- id, profile_id, jd_id（可选）, match_result_id（可选）, strategy: JSON, content: JSON, created_at

---

## 用户交互设计

### 页面结构

整体为**左侧导航 + 右侧内容区**的经典布局。

共 4 个页面：

1. `/` — Dashboard 首页
2. `/profile` — 我的档案（能力图谱编辑）
3. `/match` — JD 匹配分析
4. `/generate` — 简历生成

---

### 页面 1: Dashboard 首页 (`/`)

**目的**：快速入口 + 状态总览

**布局**：

顶部区域：欢迎语 + 两个主要入口按钮

- "上传我的简历" → 打开上传弹窗
- "开始匹配 JD" → 跳转 /match

中部区域：能力概览卡片

- 显示当前档案的技能数量、经历数量、项目数量
- 如果还没有档案，显示引导状态 "从上传简历开始，或手动创建你的能力图谱"

底部区域：最近匹配记录列表

- 每行显示：公司-职位、匹配分数（彩色进度条）、时间
- 点击进入匹配详情

---

### 页面 2: 我的档案 — 能力图谱编辑 (`/profile`)

**这是交互设计的重点页面。**

#### 整体布局

顶部：个人基础信息卡片（可点击编辑）

- 姓名、当前职位头衔、职业摘要、联系方式
- 点击任意字段即可 inline 编辑

下方：**Tab 分栏**，每个 Tab 对应一种 Item 类型

- 全部 5 个 Tab：技能 | 工作经历 | 项目 | 教育 | 证书
- 每个 Tab 右上角显示该类 Item 的数量徽标（如 "技能 (12)"）

#### Tab 内的 Item 列表交互

每个 Tab 内是一个 **Item 卡片列表**，每张卡片代表一个 Item。

**卡片状态**：

- **正常态**：显示关键信息摘要，左侧有拖拽手柄，右侧有操作按钮
- **编辑态**：卡片展开为表单，所有字段可编辑
- **隐藏态**：卡片半透明 + 删除线样式 + "已隐藏"标签，排在列表末尾

**卡片上的操作按钮**（每张卡片右上角）：

- 👁 显示/隐藏 切换（toggle 按钮，点击即切换，无需确认）
- ✏️ 编辑（展开为编辑态）
- 🗑 删除（需二次确认弹窗）

**列表顶部操作栏**：

- 左侧：筛选按钮组 → "全部 | 可见 | 已隐藏"（三选一 filter）
- 右侧："+ 添加" 按钮（手动新增一个 Item）

**拖拽排序**：

- 每张卡片左侧有 ≡ 拖拽手柄
- 拖拽后自动保存新顺序
- 仅在同类 Item 内排序

#### 技能 Tab 的特殊设计

技能 Item 因为数量多、信息密度低，采用不同于其他 Tab 的紧凑布局：

- 使用**标签组 (Tag Group)** 视图而非卡片列表
- 按 category 分组显示（如 "编程语言" 组、"框架" 组）
- 每个技能标签显示：名称 + 星级（小圆点）
- 点击标签 → 弹出编辑 Popover（而非展开卡片）
- 组之间可折叠

同时提供**切换视图**按钮，可在 "标签视图" 和 "卡片列表视图" 之间切换。

#### Item 编辑表单设计原则

- 所有表单使用 **inline 编辑**，不弹新页面
- 表单展开时，卡片平滑展开动画
- 必填字段有明确标识
- 关联技能字段使用 **Multi-Select Combobox**（可搜索已有技能，也可快速新建）
- 成果列表使用 **可增删的子项列表**，每条成果一行输入框 + 删除按钮，底部有 "+ 添加成果"
- 量化指标字段：在每条成果后面有一个可选的"添加量化数据"按钮，点击后展开（指标类型、数值、单位、上下文描述）
- 时间范围使用 **月份选择器**（YYYY-MM），结束时间有"至今"勾选框
- 保存/取消按钮在表单底部，保存后自动收起回摘要态

#### AI 解析来源的 Item 标记

当用户上传简历并经 AI 解析后，生成的 Item 会带有视觉标记：

- 卡片左上角有 "✨ AI 解析" 小标签（淡蓝色）
- 用户编辑并保存后，标签变为 "✓ 已确认"（灰色），再次编辑后标签消失
- 用户可以在列表顶部通过筛选器快速找到所有"待确认"的 AI 解析 Item

---

### 页面 3: JD 匹配分析 (`/match`)

#### 布局：左右分栏

**左栏（40%宽）**：JD 输入区

- 大文本框，用于粘贴 JD 文本
- 文本框上方有："粘贴文本" 和 "上传文件" 两个 Tab（上传支持 PDF/DOCX/TXT）
- 下方：已保存的 JD 历史列表（点击可快速加载）
- 底部："开始分析" 按钮

**右栏（60%宽）**：匹配结果展示区

分析中状态：显示 Agent 思考动画 + 进度提示（"正在解析 JD..." → "正在匹配能力图谱..." → "正在生成分析报告..."）

分析完成后展示：

**区域 1：总分卡片**

- 大数字显示匹配总分（0-100）
- 颜色编码：≥80 绿色 / 60-79 黄色 / <60 红色
- 一句话总结

**区域 2：五维雷达图**

- 五个维度：技术匹配 / 经验匹配 / 学历匹配 / 文化适配 / 成长潜力
- 每个维度可点击查看明细

**区域 3：逐条需求匹配表**

- 表格形式，每行一条 JD 需求
- 列：需求描述 | 优先级（🔴必须/🟡重要/🟢加分）| 匹配状态（强匹配✅/部分匹配🟡/弱匹配🟠/未匹配❌）| 匹配证据摘要
- 点击行可展开查看详细证据和建议

**区域 4：Gap 分析**

- 卡片列表，每张卡片是一个 Gap
- 显示：缺失项 | 严重程度 | 当前状态 vs 目标状态 | 弥补建议（含时间估计和难度）

**区域 5：简历策略建议**

- 推荐的叙事主线
- 应重点强调的内容
- 应弱化的内容
- 一键 "按此策略生成简历" → 跳转 /generate 并带入参数

---

### 页面 4: 简历生成 (`/generate`)

#### 布局：左控制面板 + 右预览区

**左面板（30%宽）**：

- 目标 JD 选择（下拉选择已解析的 JD，或"通用简历"）
- 叙事策略选择（单选）：
  - 🏆 成就驱动 — 以量化成果为主线
  - 💻 技能驱动 — 以技术能力矩阵为主线
  - 📈 成长驱动 — 以职业成长轨迹为主线
  - 👥 领导力驱动 — 以管理和影响力为主线
  - 🔧 技术深度 — 以架构和技术纵深为主线
- 语言选择：中文 / English
- 长度选择：一页 / 两页
- "生成简历" 按钮

**右预览区（70%宽）**：

- Markdown 渲染的简历预览
- 预览上方有导出按钮组："复制 Markdown" | "导出 PDF" | "导出 DOCX"
- 生成中显示 streaming 效果（逐段出现）

---

### 上传简历功能

上传功能出现在两个入口：

1. Dashboard 首页的 "上传我的简历" 按钮
2. /profile 页面顶部的 "从简历导入" 按钮

**上传弹窗交互流程**：

Step 1 — 上传文件

- 支持拖拽上传或点击选择
- 支持格式：PDF、DOCX、TXT
- 也可以直接粘贴简历文本

Step 2 — AI 解析中

- 显示加载动画 + "AI 正在解析你的简历..."
- 后台调用 Profile Agent 解析简历文本，构建结构化 Item

Step 3 — 解析结果预览

- 弹窗变为全屏 modal
- 左侧显示原始简历文本（只读）
- 右侧显示解析出的 Item 列表，按类型分组
- 每个 Item 带有勾选框（默认全选）
- 用户可以：
  - 取消勾选某个 Item（不导入）
  - 点击 Item 展开快速编辑
  - 看到 AI 不确定的字段（如技能等级）会有黄色高亮提示

Step 4 — 确认导入

- 点击 "导入选中的 N 个项目"
- 导入后跳转到 /profile 页面
- 导入的 Item 带有 "✨ AI 解析" 标签

**如果用户已有档案数据**：

- 弹窗增加提示 "你已有 X 条数据，是否合并导入？"
- 提供两个选项："合并（保留现有 + 新增解析结果）" 或 "替换（清空现有，全部用解析结果）"
- AI 会尝试去重（如检测到相同公司+相同时间的经历，标记为"疑似重复"让用户决定）

---

## Agent 系统设计

### 架构概述

系统采用多 Agent 协作架构，每个 Agent 专注一个能力域，通过结构化 JSON 接口协作。

```text
用户输入 (简历文本 / JD / 指令)
        │
        ▼
┌─────────────────────────────────────────┐
│          Orchestrator (协调器)            │
│  - 理解用户意图                           │
│  - 分发任务给子 Agent                     │
│  - 汇总结果                              │
└────┬────────┬────────┬────────┬─────────┘
     │        │        │        │
     ▼        ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐
│Profile ││  JD    ││ Match  ││Resume  │
│ Agent  ││Parser  ││ Agent  ││  Gen   │
│        ││Agent   ││        ││ Agent  │
│解构简历 ││解析JD  ││匹配分析 ││生成简历│
│构建Item ││提取需求 ││Gap分析  ││优化表述│
└────────┘└────────┘└────────┘└────────┘
     │        │        │        │
     ▼        ▼        ▼        ▼
  Item 列表  ParsedJD  MatchResult  GeneratedResume
```

### Agent 1: Profile Agent（简历解析 → Item 构建）

**输入**：简历原始文本
**输出**：结构化的 Item 列表（5 种类型）

**Prompt 设计要点**：

- 技能提取要全面：不仅提取显式提到的技能，还要从项目描述、工作职责中推断隐含技能
- 技能评级要客观：基于使用年限、项目复杂度、角色级别综合评估（1=了解 2=熟悉 3=熟练 4=精通 5=专家）
- 成果要量化：尽可能从描述中提取量化指标，如果原文没有量化，标注为 qualitative
- 关键词扩展：每个技能关联的 keywords 要包含同义词、缩写、常见变体
- 如果信息不足，相关字段留空而不是编造
- 输出严格 JSON 格式

### Agent 2: JD Parser Agent（JD 解析）

**输入**：JD 原始文本
**输出**：结构化 JD 数据

**需要提取的信息**：

- 公司、职位、级别、地点、薪资范围
- 显性需求：must_have（明确标注"必须"/"required"的）和 nice_to_have（"优先"/"preferred"的）
- 隐性需求：基于公司类型/阶段、职位级别、技术栈组合、业务领域推断的隐含需求，每条需提供推断依据
- 三维关键词：技术关键词、业务关键词、文化关键词
- 理想候选人画像：一段描述 + 核心能力 + 经验年限范围

**Prompt 设计要点**：

- 对 priority 的判断要保守：只有明确要求的才是 critical，推断的默认为 preferred
- 隐性需求必须有 reasoning 字段解释推断依据

### Agent 3: Match Agent（匹配分析）

**输入**：Profile 的全部可见 Item + 解析后的 JD
**输出**：匹配结果（含评分、逐条匹配、Gap 分析、简历策略建议）

**重要：只使用 visible=true 的 Item 参与匹配。**

**评分维度与权重**：

- technicalFit (35%): 技术技能匹配度
- experienceFit (30%): 工作经验、项目经验匹配度
- educationFit (10%): 学历、专业匹配度
- culturalFit (10%): 文化适配度（基于推断）
- growthPotential (15%): 成长潜力和学习能力

**匹配逻辑**：

- 语义匹配而非关键词匹配（如 "React" 和 "前端开发" 有强相关性）
- 逐条需求匹配，每条给出 strong_match / partial_match / weak_match / no_match 状态和证据
- Gap 分析：每个未匹配项分析差距，提供弥补建议（含时间估计和难度评级）
- 简历策略：推荐叙事主线、应强调/弱化的内容

**Prompt 设计要点**：

- 评分要有区分度，不要所有维度都给 70-80 的平庸分
- 可迁移技能要识别（如后端工程师的系统设计能力可以匹配架构师需求）
- competitive analysis 要具体

### Agent 4: Resume Generation Agent（简历生成）

**输入**：Profile 可见 Item + 匹配结果（可选）+ 生成策略
**输出**：Markdown 格式的简历内容

**叙事策略**：

- achievement: 以量化成果为主线
- skill: 以技能矩阵为主线
- growth: 以成长轨迹为主线
- leadership: 以管理和影响力为主线
- technical: 以技术深度和架构能力为主线

**Prompt 设计要点**：

- 根据匹配结果的 resumeStrategy 调整内容重点
- 使用 JD 中的关键词自然融入（不堆砌）
- 每条成果遵循 STAR/XYZ 法
- 动词开头，主动语态
- 量化 > 定性，具体 > 模糊
- 不编造候选人没有的经历或技能
- 只使用 visible=true 的 Item

---

## API 路由设计

### Profile 相关

- **GET /api/profile** — 获取当前档案（含所有 Item）
- **PUT /api/profile** — 更新档案基础信息（姓名、头衔、摘要、联系方式）
- **POST /api/profile/import** — 上传简历文件/文本，调用 Profile Agent 解析，返回解析出的 Item 列表（不直接入库，等用户确认）
- **POST /api/profile/import/confirm** — 用户确认后，批量导入选中的 Item

### Item CRUD

- **GET /api/items?type=skill&visible=true** — 查询 Item 列表，支持 type 和 visible 筛选
- **POST /api/items** — 创建新 Item
- **PUT /api/items/:id** — 更新 Item（含编辑字段、切换显隐、更新排序）
- **DELETE /api/items/:id** — 删除 Item（需前端二次确认）
- **PUT /api/items/reorder** — 批量更新排序（拖拽后调用）
- **PUT /api/items/:id/visibility** — 切换单个 Item 显隐状态

### JD 相关

- **POST /api/jd/parse** — 提交 JD 文本或文件，调用 JD Parser Agent 解析
- **GET /api/jd** — 获取已保存的 JD 列表
- **GET /api/jd/:id** — 获取单个 JD 详情

### 匹配相关

- **POST /api/match** — 执行匹配分析（传入 jdId，自动使用当前 profile 的可见 Item）
- **GET /api/match** — 获取匹配历史列表
- **GET /api/match/:id** — 获取单个匹配结果详情

### 简历生成

- **POST /api/generate** — 生成简历（传入 strategy + 可选的 jdId 和 matchResultId）
- **GET /api/generate/:id** — 获取生成的简历
- **GET /api/generate/:id/export?format=markdown|pdf|docx** — 导出指定格式

---

## 项目结构

```text
resume-agent/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── drizzle.config.ts
├── .env.local                    # OPENAI_API_KEY=sk-ant-...
│
├── src/
│   ├── app/                      # Next.js App Router 页面
│   │   ├── layout.tsx            # 全局布局（左侧导航 + 右侧内容）
│   │   ├── page.tsx              # Dashboard 首页
│   │   ├── profile/
│   │   │   └── page.tsx          # 我的档案（能力图谱编辑）
│   │   ├── match/
│   │   │   └── page.tsx          # JD 匹配分析
│   │   ├── generate/
│   │   │   └── page.tsx          # 简历生成
│   │   └── api/                  # API 路由（结构同上方 API 设计）
│   │       ├── profile/
│   │       ├── items/
│   │       ├── jd/
│   │       ├── match/
│   │       └── generate/
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts         # OPENAI SDK 封装（统一的 callAgent 函数）
│   │   │   ├── prompts.ts        # 所有 Prompt 模板集中管理
│   │   │   └── agents/
│   │   │       ├── profile-agent.ts
│   │   │       ├── jd-parser-agent.ts
│   │   │       ├── match-agent.ts
│   │   │       └── resume-gen-agent.ts
│   │   │
│   │   ├── db/
│   │   │   ├── schema.ts         # Drizzle Schema
│   │   │   ├── index.ts          # DB 连接
│   │   │   └── migrations/
│   │   │
│   │   ├── types/
│   │   │   ├── item.ts           # Item 相关类型定义（5 种 Item + 通用属性）
│   │   │   ├── profile.ts        # Profile 类型
│   │   │   ├── jd.ts             # JD 结构类型
│   │   │   ├── match.ts          # 匹配结果类型
│   │   │   └── resume.ts         # 简历输出类型
│   │   │
│   │   └── utils/
│   │       ├── file-parser.ts    # 文件解析（PDF/DOCX/TXT → 文本）
│   │       └── export.ts         # 简历导出工具
│   │
│   └── components/
│       ├── ui/                   # shadcn/ui 基础组件
│       ├── layout/
│       │   ├── Sidebar.tsx       # 左侧导航
│       │   └── Header.tsx
│       ├── profile/
│       │   ├── ProfileHeader.tsx       # 个人基础信息卡片（inline 编辑）
│       │   ├── ItemTabs.tsx            # 5 个 Tab 分栏容器
│       │   ├── ItemCard.tsx            # 通用 Item 卡片（正常态/编辑态/隐藏态）
│       │   ├── ItemForm.tsx            # 通用 Item 编辑表单（根据 type 渲染不同字段）
│       │   ├── SkillTagView.tsx        # 技能标签视图（紧凑布局）
│       │   ├── AchievementList.tsx     # 成果子项列表组件
│       │   ├── SkillSelector.tsx       # 关联技能选择器（Multi-Select Combobox）
│       │   └── ImportModal.tsx         # 简历上传 + 解析预览 Modal
│       ├── match/
│       │   ├── JDInput.tsx             # JD 输入面板（文本/上传 Tab）
│       │   ├── MatchScoreCard.tsx      # 总分大卡片
│       │   ├── RadarChart.tsx          # 五维雷达图
│       │   ├── RequirementTable.tsx    # 逐条匹配表格
│       │   ├── GapAnalysis.tsx         # Gap 分析卡片列表
│       │   └── StrategyAdvice.tsx      # 简历策略建议
│       ├── generate/
│       │   ├── StrategyPanel.tsx       # 左侧策略选择面板
│       │   ├── ResumePreview.tsx       # 右侧 Markdown 预览
│       │   └── ExportButtons.tsx       # 导出按钮组
│       └── shared/
│           ├── LoadingAgent.tsx         # Agent 思考中动画
│           ├── FileUpload.tsx           # 通用文件上传组件
│           └── EmptyState.tsx           # 空状态引导组件
│
└── db/
    └── resume-agent.db
```

---

## 开发阶段

### Phase 1: 数据基础 + 手动编辑

1. 项目初始化（Next.js + Tailwind + shadcn/ui + Drizzle + SQLite）
2. 数据库 schema 实现 + migration
3. Item CRUD API 全部实现
4. /profile 页面：ProfileHeader + ItemTabs + ItemCard + ItemForm（全部 5 种 Item 的手动增删改查 + 显隐切换 + 拖拽排序）
5. Dashboard 基础框架

### Phase 2: AI 解析 + 导入

1. OPENAI SDK 封装 + Prompt 管理
2. Profile Agent 实现（简历文本 → Item 列表）
3. 文件解析工具（PDF/DOCX/TXT → 文本）
4. ImportModal 完整交互（上传 → 解析 → 预览 → 确认导入）
5. 去重检测逻辑

### Phase 3: JD 匹配

1. JD Parser Agent 实现
2. Match Agent 实现
3. /match 页面全部 UI（JD 输入 + 结果展示 + 雷达图 + Gap 分析）
4. JD 历史管理

### Phase 4: 简历生成

1. Resume Gen Agent 实现
2. /generate 页面（策略选择 + Markdown 预览 + streaming 效果）
3. 导出功能（Markdown / PDF / DOCX）

---

## 实现约定

### 代码规范

- TypeScript strict mode
- 函数式组件 + React Hooks
- async/await，不用 .then()
- API 路由统一 try-catch，返回 `{ error: string, details?: any }` 格式的错误
- 组件文件名 PascalCase，工具函数 camelCase
- ID 使用 nanoid 生成，带类型前缀（如 sk_xxx, exp_xxx, prj_xxx, edu_xxx, cert_xxx）

### AI 调用约定

- 所有 AI 调用通过统一的 callAgent 函数封装
- Prompt 集中在 prompts.ts，不在其他文件硬编码
- 结构化输出通过在 system prompt 中指定 JSON Schema
- 模型统一使用 claude-sonnet-4-20250514
- 合理设置 max_tokens：解析类 4096，分析/生成类 8192

### 数据约定

- 时间格式 ISO 8601
- Item 的 data 字段为 JSON 序列化存储
- 关键数值字段冗余存储方便查询（如 match_results.overall_score）
- visible 默认 true，sort_order 新建时自动递增

### UI 约定

- shadcn/ui 作为基础组件库
- Recharts 做数据可视化
- 响应式设计
- Agent 执行中显示 LoadingAgent 组件 + 阶段性文案
- 表单编辑使用 inline 展开，不跳页
- 删除操作统一需要二次确认
- 显隐切换为即时操作，无需确认

---

## 环境变量

```text
OPENAI_API_KEY=sk-ant-xxx    # 必须
DATABASE_URL=./db/resume-agent.db
```

---

## 启动命令

```bash
pnpm install
pnpm db:push        # 初始化数据库
pnpm dev            # 启动开发服务器 http://localhost:3000
```
