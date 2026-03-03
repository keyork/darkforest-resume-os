# darkforest-resume-os

基于 LLM Agent 的履历优化框架，将简历结构化建模，并针对目标岗位 JD 进行动态匹配与多版本定制生成。

## 功能

- **简历管理** — 以结构化 Item 模型管理技能、工作经历、项目、教育背景、证书；支持拖拽排序、显隐控制
- **AI 导入** — 上传 PDF / DOCX / TXT 简历，AI 自动解析为结构化数据，支持预览确认与去重检测
- **JD 匹配分析** — 粘贴职位描述，AI 从五个维度评分（技术匹配、经验匹配、学历匹配、文化适配、成长潜力），生成差距分析与简历策略建议
- **简历生成** — 选择叙事策略（成果导向 / 技能导向 / 成长轨迹 / 领导力 / 技术深度）、语言和页数，AI 输出 Markdown 格式简历，支持复制与下载

## 技术栈

| 层级 | 技术 |
| ------ | ------ |
| 框架 | Next.js 14 App Router · TypeScript strict |
| UI | Tailwind CSS · shadcn/ui (New York, zinc) · Recharts |
| 状态 | TanStack Query v5 · nuqs |
| 数据库 | Drizzle ORM · better-sqlite3 (SQLite) |
| AI | OpenAI SDK → Moonshot API (kimi-k2-5) |
| 表单 | react-hook-form · zod |
| 拖拽 | @dnd-kit/core · @dnd-kit/sortable |
| 文件解析 | pdf-parse · mammoth |

## 快速开始

### 1 安装依赖

```bash
npm install
```

### 2 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API Key：

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.moonshot.cn/v1
DATABASE_URL=./db/resume-agent.db
```

### 3 初始化数据库

```bash
npm run db:push
```

### 4 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 项目结构

```text
src/
├── app/
│   ├── page.tsx                  # 首页 Dashboard
│   ├── profile/page.tsx          # 简历管理
│   ├── match/page.tsx            # JD 匹配分析
│   ├── generate/page.tsx         # 简历生成
│   └── api/                      # API 路由
│       ├── profile/              # 个人信息 + AI 导入
│       ├── items/                # Item CRUD + 排序 + 显隐
│       ├── jd/                   # JD 解析
│       ├── match/                # 匹配分析
│       └── generate/             # 简历生成
├── components/
│   ├── profile/                  # 简历管理组件
│   ├── match/                    # 匹配分析组件
│   ├── generate/                 # 简历生成组件
│   └── shared/                   # 公共组件
└── lib/
    ├── ai/
    │   ├── agents/               # profile / jd / match / resume-gen agent
    │   ├── client.ts             # callAgent<T>() 封装
    │   └── prompts.ts            # 所有 System Prompt
    ├── db/
    │   ├── schema.ts             # Drizzle 表结构
    │   └── index.ts              # DB 单例
    ├── hooks/                    # React Query hooks
    └── types/                    # TypeScript 类型定义
```

## 可用脚本

```bash
npm run dev        # 开发服务器
npm run build      # 生产构建
npm run db:push    # 同步数据库 schema
npm run db:studio  # Drizzle Studio 可视化数据库
```

## AI 引擎说明

默认使用 [Moonshot Kimi](https://platform.moonshot.cn) API（与 OpenAI SDK 兼容）。
如需切换其他 OpenAI 兼容服务，修改 `.env.local` 中的 `OPENAI_BASE_URL` 和 `OPENAI_API_KEY` 即可。
