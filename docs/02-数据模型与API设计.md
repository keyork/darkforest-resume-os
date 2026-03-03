# 02-数据模型与 API 设计

## 1. 数据库概览

项目使用 SQLite，schema 定义在 `src/lib/db/schema.ts`。

当前包含 5 张核心表：

- `profiles`
- `items`
- `job_descriptions`
- `match_results`
- `generated_resumes`

## 2. 表结构说明

## 2.1 `profiles`

用于保存档案元信息。

字段：

- `id`：主键
- `name`：姓名
- `title`：当前职位头衔
- `summary`：职业摘要
- `contact`：JSON 字符串，保存联系方式
- `created_at`
- `updated_at`

当前实现中默认只使用一个档案：

- `profile_default`

## 2.2 `items`

用于统一存储所有履历条目。

字段：

- `id`
- `profile_id`
- `type`
- `data`
- `visible`
- `sort_order`
- `source`
- `created_at`
- `updated_at`

其中：

- `type` 决定 `data` 的结构
- `visible = false` 的条目不会参与匹配与生成
- `source` 用来区分手动创建还是 AI 导入

## 2.3 `job_descriptions`

用于保存原始 JD 与解析结果。

字段：

- `id`
- `raw_text`
- `parsed`
- `created_at`

`parsed` 是结构化 `ParsedJD` 的 JSON 字符串。

## 2.4 `match_results`

用于保存某个档案与某个 JD 的匹配分析结果。

字段：

- `id`
- `profile_id`
- `jd_id`
- `result`
- `overall_score`
- `created_at`

其中 `result` 保存完整匹配结果 JSON，`overall_score` 单独冗余存储，方便列表页快速展示。

## 2.5 `generated_resumes`

用于保存生成后的 Markdown 简历及生成策略。

字段：

- `id`
- `profile_id`
- `jd_id`
- `match_result_id`
- `strategy`
- `content`
- `created_at`

## 3. 序列化与反序列化

数据库层通过 `src/lib/db/index.ts` 中的工具方法做对象转换。

### 3.1 `serializeItem`

把数据库行数据转成前端可用的 `Item` 联合类型对象。

做法：

- 读取 `raw.data`
- `JSON.parse`
- 与通用字段合并

### 3.2 `serializeProfile`

把 `contact` JSON 字符串解析为对象。

### 3.3 `extractItemData`

用于从完整 Item 中剥离数据库通用字段，仅保留 `data` 部分。

## 4. API 设计原则

当前 API 位于 `src/app/api`，采用 App Router Route Handler。

整体特点：

- 默认都是动态路由 `force-dynamic`
- 每个业务模块按资源拆分
- Route 负责参数校验、数据库读写、AI 调用编排
- 前端通过 hooks 层调用，不直接在页面里分散写 fetch

## 5. Profile API

### 5.1 `GET /api/profile`

职责：

- 读取默认档案
- 如果档案不存在则自动创建空档案

### 5.2 `PUT /api/profile`

职责：

- 更新姓名、头衔、摘要、联系方式

特点：

- 支持部分字段更新
- `contact` 会被序列化为 JSON 字符串

### 5.3 `DELETE /api/profile`

职责：

- 删除默认档案下的所有 Item
- 将档案基础字段重置为空

这不是物理删除档案，而是“清空档案内容”。

## 6. Items API

### 6.1 `GET /api/items`

支持查询参数：

- `type`
- `visible`

用于：

- 按类型取列表
- 只看可见项或隐藏项

### 6.2 `POST /api/items`

创建 Item。

特点：

- 自动按同类型条目数生成 `sortOrder`
- 默认 `visible = true`
- 默认 `source = manual`

### 6.3 `GET /api/items/[id]`

读取单条 Item。

### 6.4 `PUT /api/items/[id]`

更新 Item。

可更新：

- `data`
- `visible`
- `sortOrder`
- `source`

### 6.5 `DELETE /api/items/[id]`

删除单条 Item。

### 6.6 `PUT /api/items/[id]/visibility`

切换 `visible` 状态。

特点：

- 这是一个专门的快捷接口
- UI 可以直接调用，不必自己先读后改

### 6.7 `PUT /api/items/reorder`

批量更新排序。

请求体：

- `items: [{ id, sortOrder }]`

## 7. JD API

### 7.1 `GET /api/jd`

返回所有 JD，按创建时间倒序。

### 7.2 `POST /api/jd`

职责：

- 从请求头获取 AI 配置
- 调用 JD 解析 Agent
- 把原始 JD 与解析结果一起入库

### 7.3 `GET /api/jd/[id]`

读取单条 JD。

### 7.4 `DELETE /api/jd/[id]`

删除单条 JD。

## 8. Match API

### 8.1 `GET /api/match`

返回匹配结果列表摘要。

只返回列表页需要的轻量字段：

- `id`
- `overallScore`
- `summary`
- `createdAt`

### 8.2 `POST /api/match`

职责：

1. 从请求体拿 `jdId`
2. 读取已解析 JD
3. 读取默认档案下所有可见 Item
4. 拼接候选人概要
5. 调用匹配 Agent
6. 将分析结果写入 `match_results`

### 8.3 `GET /api/match/[id]`

读取完整匹配结果。

### 8.4 `DELETE /api/match/[id]`

删除匹配结果。

## 9. Generate API

### 9.1 `GET /api/generate`

返回生成历史列表，不包含完整 Markdown 内容。

### 9.2 `POST /api/generate`

职责：

1. 校验策略参数
2. 读取默认档案的可见 Item
3. 读取档案元信息
4. 按需读取 JD
5. 按需读取 Match Result
6. 调用简历生成 Agent
7. 存储生成结果

### 9.3 `GET /api/generate/[id]`

读取单条生成结果，包括完整 Markdown。

### 9.4 `DELETE /api/generate/[id]`

删除生成记录。

## 10. Profile Import API

### 10.1 `POST /api/profile/import`

职责：

- 接收上传文件或纯文本
- 文件转文本
- 调用简历解析 Agent
- 返回原文与结构化结果

注意：

- 该接口本身不写数据库
- 它只负责“解析”和“预览”

### 10.2 `POST /api/profile/import/confirm`

职责：

- 根据用户在预览页的选择真正写库
- 支持 `merge` / `replace`
- 同时更新 `profiles` 与 `items`

当前实现中的“重复检测”比较轻量，主要针对 `experience` 的公司名 + 开始时间。

## 11. 错误处理约定

整体风格是：

- 参数错误：`400`
- 资源不存在：`404`
- 服务器或 AI 调用异常：`500`

对于 AI 相关接口，还额外区分：

- 如果缺少前端传入的 AI 配置，则返回 `400`
- 这类错误信息会明确提示用户先去“设置”页面

## 12. 当前 API 的边界与限制

- 没有鉴权与用户隔离
- 没有分页
- 没有严格 schema validation 中间层
- 多数 JSON 解析依赖 TypeScript 类型约束而不是运行时校验
- 目前适合单机、单用户、本地使用场景

