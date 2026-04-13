# 02-数据模型与 API 设计

## 1. 当前数据模型

项目当前不再使用数据库持久化，所有业务数据都保存在浏览器工作区：

- `profile`
- `items`
- `jds`
- `matchResults`
- `generatedResumes`

对应实现位于 `src/lib/client/workspace-storage.ts`，统一序列化到一个 `localStorage` key 下。

## 2. 领域对象

### 2.1 Profile

默认只有一个档案：

- `id = profile_default`

包含：

- 姓名、职位头衔、职业摘要
- 联系方式对象
- `createdAt` / `updatedAt`

### 2.2 Item

所有履历条目统一建模为 `Item` 联合类型，支持：

- `skill`
- `experience`
- `project`
- `education`
- `certification`

所有 Item 都具备：

- `visible`
- `sortOrder`
- `source`
- `createdAt`
- `updatedAt`

### 2.3 Job Description

JD 同时保存：

- 原始文本 `rawText`
- 结构化解析结果 `parsed`
- 创建时间 `createdAt`

### 2.4 Match Result

匹配结果保存：

- 评分
- 总结
- requirement matches
- gaps
- resume strategy

并通过 `jdId` 关联对应 JD。

### 2.5 Generated Resume

生成结果保存：

- 生成策略 `strategy`
- Markdown 正文 `content`
- 可选 `jdId`
- 可选 `matchResultId`

## 3. 数据操作入口

前端统一通过 hooks 层访问工作区数据：

- `useProfile`
- `useItems`
- `useJD`
- `useMatch`
- `useGenerate`

这些 hooks 负责：

- 读取本地工作区
- 调用 AI agent
- 落盘到浏览器工作区
- 触发 React Query 失效刷新

## 4. API 边界

当前保留的服务端 API 只承担最小职责：

- 文件上传后的文本提取

AI 调用链已经切换为浏览器直连 OpenAI-compatible API，不再经过服务端中转。

## 5. 风险与约束

- `localStorage` 适合单人、本地优先场景
- 清理浏览器数据或切换设备会丢失工作区
- 如果要支持多设备同步，后续需要增加导出/导入或云端存储方案
