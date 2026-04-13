# darkforest-resume-os

一个面向求职场景的本地优先简历工作台。

它不是“让 AI 直接吐一份简历”的一次性工具，而是把你的履历拆成可管理、可复用、可针对岗位重组的结构化资产，再围绕目标 JD 做匹配分析和多版本生成。

## 这是什么

`darkforest-resume-os` 想解决的是传统简历工作流里的三个低效点：

- 履历内容散落在 Word、PDF、招聘网站和聊天记录里，难以复用
- 面对不同 JD 时，需要反复手改措辞和排序，很难稳定输出
- AI 能写，但如果没有结构化上下文，往往会写得空泛、失真或不一致

这个项目把“简历”拆成一套可计算的职业档案，再让 AI 参与三个关键环节：

- 把旧简历解析成结构化档案
- 把目标 JD 解析成要求画像，并与你的档案做五维匹配
- 按不同叙事策略生成可直接继续修改的 Markdown 简历

## 当前产品形态

当前版本是一个单用户、本地优先的求职工作台：

- 前端基于 `Next.js 14 App Router`
- AI 通过网页里的“设置”页配置，由浏览器直接请求 OpenAI 兼容接口
- 实际使用中的档案、JD、匹配结果、生成简历，默认保存在浏览器 `localStorage`

这意味着它很适合个人本地使用、快速验证产品形态，以及继续往“求职操作系统”方向演进。

## 核心能力

### 1. 结构化档案管理

把履历拆成独立条目进行维护，而不是只维护一份整页简历。

- 支持五类条目：技能、工作经历、项目、教育、证书
- 支持显隐控制、排序调整、手动编辑
- 支持按条目沉淀成长期可复用的职业素材库

### 2. AI 简历导入

把已有 PDF / DOCX / TXT 简历导入系统，自动解析为结构化数据。

- 支持文件上传和纯文本粘贴
- 支持解析预览、勾选导入、重复项识别
- 支持 `merge` / `replace` 两种导入模式

### 3. JD 解析与匹配分析

把职位描述从一段文本，变成可操作的岗位画像。

- 提取岗位、公司、地点、年限、关键词等信息
- 生成 `must-have` / `nice-to-have` / 隐性要求
- 基于你的档案输出五维评分：
  - 技术匹配
  - 经验匹配
  - 学历匹配
  - 文化适配
  - 成长潜力
- 输出差距项、证据说明和简历策略建议

### 4. 多策略简历生成

不是只生成“标准版简历”，而是根据目标岗位切换叙事方式。

- 支持五种叙事策略：
  - 成果导向
  - 技能导向
  - 成长轨迹
  - 领导力
  - 技术深度
- 支持中英文输出
- 支持 1 页 / 2 页长度
- 输出 Markdown，可直接复制、下载、继续加工

### 5. 跨页面 Agent 任务轨道

AI 动作不是黑盒弹窗，而是可追踪任务。

- JD 解析、简历解析、匹配分析、简历生成都会进入任务轨道
- 支持跨页面查看进度、成功状态和失败信息
- 更适合多步骤求职工作流，而不是一次性问答

## 典型使用流程

1. 进入 `设置` 页面，填入模型服务的 `API Key`、`Base URL` 和模型名。
2. 上传历史简历，或手动录入你的结构化档案。
3. 在 `我的档案` 页面清理条目、补充细节、隐藏不想展示的内容。
4. 在 `JD 匹配分析` 页面粘贴目标岗位描述，得到评分、差距项和叙事建议。
5. 在 `简历生成` 页面选择策略、语言、篇幅，并叠加 JD / 匹配结果上下文。
6. 导出 Markdown 简历，继续精修或转成最终投递版本。

## 运行方式

### 环境要求

- Node.js `18+`
- npm

### 1. 安装依赖

```bash
npm install
```

### 2. 准备环境变量

```bash
cp .env.example .env.local
```

当前版本没有必填环境变量。

### 3. 启动开发环境

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 4. 在网页里填写 AI 设置

进入 `/settings` 页面后，填写：

- `API Key`
- `Base URL`
- `模型名`

这些设置会保存在当前浏览器的 `localStorage`，不会写入 `.env.local`。

常见服务示例：

- Moonshot / Kimi：`https://api.moonshot.cn/v1`
- OpenAI：`https://api.openai.com/v1`
- 其他 OpenAI 兼容服务：以服务商文档为准

默认模型常量当前是：

```text
moonshotai/Kimi-K2.5
```

实际使用时请替换为你账号可调用的模型。

## 数据存储说明

这是理解当前项目状态最重要的一部分。

当前主流程数据保存在浏览器侧 `localStorage`：

- Profile
- Items
- Job Descriptions
- Match Results
- Generated Resumes
- AI 设置

优点：

- 本地启动即可用，不依赖后端账号系统
- 开发和产品验证成本低
- 交互反馈快，适合单人求职场景

注意：

- 更换浏览器、使用无痕模式、清理站点数据后，这些内容会丢失
- 不适合直接当成多设备同步方案

## 项目结构

```text
src/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── profile/page.tsx          # 结构化档案管理
│   ├── match/page.tsx            # JD 匹配分析
│   ├── generate/page.tsx         # 简历生成
│   ├── settings/page.tsx         # AI 配置
│   └── api/                      # 文件转文本等最小服务端能力
├── components/
│   ├── profile/                  # 档案页组件
│   ├── match/                    # 匹配分析组件
│   ├── generate/                 # 生成页组件
│   ├── agent/                    # Agent 任务系统
│   └── shared/                   # 通用组件
└── lib/
    ├── ai/
    │   ├── agents/               # profile / jd / match / resume generation agents
    │   ├── client.ts             # 浏览器直连 OpenAI-compatible API 调用封装
    │   └── prompts.ts            # 系统提示词
    ├── client/
    │   ├── ai-settings.ts        # 浏览器端 AI 配置
    │   └── workspace-storage.ts  # 浏览器工作区存储
    ├── hooks/                    # React Query hooks
    └── types/                    # 领域模型定义
```

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 应用框架 | Next.js 14 App Router · React 18 · TypeScript |
| UI | Tailwind CSS · shadcn/ui · Radix UI · Recharts |
| 状态管理 | TanStack Query v5 · nuqs |
| AI 接入 | 浏览器直连 OpenAI-compatible API |
| 文件解析 | `pdf-parse` · `mammoth` |
| 拖拽 | `@dnd-kit` |

## 可用脚本

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 文档入口

产品和技术文档都放在 [`docs`](./docs) 目录。

- [产品介绍](./docs/00-产品介绍.md)
- [系统架构概览](./docs/01-系统架构概览.md)
- [数据模型与 API 设计](./docs/02-数据模型与API设计.md)
- [AI 调用链与配置机制](./docs/03-AI调用链与配置机制.md)
- [前端页面与任务系统](./docs/04-前端页面与任务系统.md)
- [产品路线图](./docs/05-产品路线图.md)

## 适合谁

这个项目比较适合：

- 想把“简历生成器”做成“求职操作系统”的产品团队
- 想验证本地优先、AI 增强型简历工作流的独立开发者
- 想在现有代码基础上继续扩展投递追踪、面试准备、数据导出能力的人

如果你要的是一个立即可商用的 SaaS 多租户后台，这个仓库还没有走到那一步；但如果你要的是一个已经具备清晰产品骨架的原型，它已经足够具体。
