'use client';

import type { WorkspaceSnapshot } from '@/lib/client/workspace-storage';
import {
  PROFILE_DEFAULT_ID,
  getWorkspace,
  replaceWorkspace,
  resetWorkspace,
} from '@/lib/client/workspace-storage';

const DEMO_MODE_STORAGE_KEY = 'darkforest.demo.enabled';
const DEMO_WORKSPACE_BACKUP_KEY = 'darkforest.demo.workspace-backup';

const DEMO_TIMESTAMPS = {
  profileCreatedAt: '2026-03-01T09:00:00.000Z',
  profileUpdatedAt: '2026-04-06T10:20:00.000Z',
  itemsCreatedAt: '2026-03-02T08:30:00.000Z',
  itemsUpdatedAt: '2026-04-06T10:20:00.000Z',
  jdAgentCreatedAt: '2026-04-07T11:20:00.000Z',
  jdPmCreatedAt: '2026-04-08T13:10:00.000Z',
  matchAgentCreatedAt: '2026-04-07T11:36:00.000Z',
  matchPmCreatedAt: '2026-04-08T13:28:00.000Z',
  resumeAgentCreatedAt: '2026-04-07T11:50:00.000Z',
  resumePmCreatedAt: '2026-04-08T13:46:00.000Z',
} as const;

function createDemoWorkspace(): WorkspaceSnapshot {
  const skillAgentId = 'sk_demo_agent';
  const skillTsId = 'sk_demo_ts';
  const skillPromptId = 'sk_demo_prompt';
  const skillProductId = 'sk_demo_product';
  const skillDataId = 'sk_demo_data';

  return {
    version: 1,
    profile: {
      id: PROFILE_DEFAULT_ID,
      name: '王大猫',
      title: 'Agent工程师',
      summary:
        '5 年智能应用与工作流产品经验，当前聚焦 Agent 系统、工具调用编排、前端工作台与 AI 产品落地。擅长把复杂流程拆成可执行节点，并在提示词、状态机、交互反馈与业务指标之间建立闭环。',
      contact: {
        email: 'wangdamao.demo@example.com',
        phone: '+86 138-0000-9527',
        location: '上海',
        website: 'https://demo.example.com/wangdamao',
        linkedin: 'linkedin.com/in/wangdamao-demo',
        github: 'github.com/wangdamao-demo',
      },
      createdAt: DEMO_TIMESTAMPS.profileCreatedAt,
      updatedAt: DEMO_TIMESTAMPS.profileUpdatedAt,
    },
    items: [
      {
        id: skillAgentId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: 'Agent 应用开发',
        category: 'framework',
        level: 5,
        yearsOfExperience: 3,
        lastUsed: '2026-04',
        keywords: ['Agent', '多步骤工作流', '工具调用', '任务编排', '状态机'],
        notes: '负责过简历 Agent、运营 Copilot 和知识问答 Agent 的端到端落地。',
      },
      {
        id: skillTsId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 1,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: 'TypeScript 工程化',
        category: 'programming_language',
        level: 5,
        yearsOfExperience: 5,
        lastUsed: '2026-04',
        keywords: ['TypeScript', 'Schema', '类型安全', 'Zod', '前端架构'],
      },
      {
        id: skillPromptId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 2,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: 'Prompt 设计与编排',
        category: 'methodology',
        level: 4,
        yearsOfExperience: 2,
        lastUsed: '2026-04',
        keywords: ['Prompt', '提示词', '规划', '评审', '重试策略'],
      },
      {
        id: skillProductId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 3,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: '产品需求拆解',
        category: 'management',
        level: 4,
        yearsOfExperience: 4,
        lastUsed: '2026-04',
        keywords: ['需求分析', 'PRD', '用户流程', '跨团队协作', '产品判断'],
      },
      {
        id: skillDataId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 4,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: '数据分析与实验优化',
        category: 'data',
        level: 4,
        yearsOfExperience: 3,
        lastUsed: '2026-03',
        keywords: ['漏斗分析', 'A/B 测试', '激活率', '转化率', '看板'],
      },
      {
        id: 'exp_demo_darkforest',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'experience',
        company: '黑森林智能',
        title: 'Agent工程师',
        startDate: '2024-02',
        endDate: undefined,
        isCurrent: true,
        location: '上海',
        description:
          '负责求职与知识工作流 Agent 的设计与落地，覆盖任务拆解、工具调用、前端工作台、结果评审与用户反馈闭环，直接对流程完成率和结果可用性负责。',
        achievements: [
          {
            id: 'ach_demo_darkforest_1',
            description: '设计多阶段简历 Agent 流程，把导入、档案结构化、JD 匹配、简历生成拆成可观测节点。',
            metrics: { type: 'conversion', value: 33, unit: '%', context: '完整流程完成率提升' },
          },
          {
            id: 'ach_demo_darkforest_2',
            description: '建立 Prompt 规划、评审与重试机制，降低结构化输出错误和空结果比例。',
            metrics: { type: 'quality', value: 41, unit: '%', context: '错误重跑率下降' },
          },
          {
            id: 'ach_demo_darkforest_3',
            description: '与产品和设计共同优化 Agent 任务状态反馈，让用户更容易理解每一步为何执行、何时完成、如何兜底。',
            metrics: { type: 'satisfaction', value: 24, unit: '%', context: '任务结果确认率提升' },
          },
        ],
        relatedSkills: [skillAgentId, skillTsId, skillPromptId, skillProductId],
        industryTags: ['AI Agent', '求职工具', '工作流产品'],
      },
      {
        id: 'exp_demo_xinghai',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 1,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'experience',
        company: '星海产品实验室',
        title: '高级前端工程师 / 产品协同',
        startDate: '2021-03',
        endDate: '2024-01',
        isCurrent: false,
        location: '上海',
        description:
          '负责内容与运营工作台的前端实现，同时承担需求梳理、埋点口径对齐和核心页面改版复盘，是工程与产品之间的高频协作桥梁。',
        achievements: [
          {
            id: 'ach_demo_xinghai_1',
            description: '主导运营工作台改版，梳理关键角色与流程路径，统一任务状态和信息层级。',
            metrics: { type: 'efficiency', value: 29, unit: '%', context: '高频任务平均完成时长下降' },
          },
          {
            id: 'ach_demo_xinghai_2',
            description: '搭建数据看板与实验复盘机制，让页面迭代从“凭感觉”切换到“有指标依据”。',
            metrics: { type: 'growth', value: 18, unit: '%', context: '目标功能激活率提升' },
          },
        ],
        relatedSkills: [skillTsId, skillProductId, skillDataId],
        industryTags: ['SaaS 工作台', '数据产品', '流程优化'],
      },
      {
        id: 'prj_demo_resume_agent',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '简历 Agent 工作台',
        role: 'Agent 方案负责人',
        description:
          '一个把旧简历拆为结构化档案，并结合岗位要求完成匹配分析与定向改写的多步骤 Agent 工作台。',
        techStack: ['Next.js', 'TypeScript', 'OpenAI 兼容接口', 'Zod', '本地工作区'],
        achievements: [
          {
            id: 'ach_demo_project_1',
            description: '将复杂的 AI 能力拆成用户可理解的任务链路，降低“黑盒感”。',
          },
          {
            id: 'ach_demo_project_2',
            description: '采用浏览器本地工作区与前端直连模型服务方案，降低服务端数据留存风险。',
          },
        ],
        relatedSkills: [skillAgentId, skillTsId, skillPromptId, skillProductId, skillDataId],
        url: 'https://demo.example.com/agent-workspace',
        startDate: '2025-10',
        endDate: '2026-04',
      },
      {
        id: 'edu_demo_zju',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'education',
        school: '浙江大学',
        degree: '本科',
        major: '软件工程',
        startDate: '2016-09',
        endDate: '2020-06',
        gpa: '3.8 / 4.0',
        highlights: ['人机交互课程项目', '校级创业实践团队核心成员'],
      },
      {
        id: 'cert_demo_ai',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'certification',
        name: '智能体应用实践认证',
        issuer: '开放应用研究院',
        issueDate: '2025-11',
        credentialId: 'AGENT-DEMO-2025',
        relatedSkills: [skillAgentId, skillPromptId],
      },
    ],
    jds: [
      {
        id: 'jd_demo_agent_engineer',
        rawText: `职位名称：Agent工程师
公司：北辰智能

我们正在招聘一位 Agent 工程师，负责把大模型能力接入真实业务流程，设计可执行、可监控、可恢复的多步骤智能体系统。你将与产品、设计、后端和算法同学紧密协作，推动 Agent 从 Demo 走向稳定可用的生产场景。

岗位职责：
1. 设计智能体工作流，拆分规划、执行、校验、重试等关键节点。
2. 负责工具调用、结果结构化、状态反馈与前端工作台体验。
3. 与产品团队共同定义场景边界、成功指标和用户交互方式。
4. 优化 Agent 的稳定性、可解释性和执行成功率。

岗位要求：
1. 有 AI Agent、多步骤工作流或 LLM 应用落地经验。
2. 熟悉前端或全栈工程，能够独立实现工作台与调用链路。
3. 对 Prompt 设计、结构化输出、失败兜底和重试策略有实践。
4. 具备较强的问题拆解与跨团队协作能力。

加分项：
1. 做过求职、知识管理、运营提效等工作流产品。
2. 有实验优化或数据复盘意识。
3. 能把抽象模型能力转成清晰可理解的用户体验。`,
        parsed: {
          company: '北辰智能',
          position: 'Agent工程师',
          level: '高级',
          location: '上海 / 远程协作',
          salaryRange: '35k-55k / 月',
          mustHave: [
            '有 Agent、工作流编排或 LLM 应用落地经验。',
            '能独立处理前端工作台、工具调用与结果结构化链路。',
            '理解 Prompt 设计、失败兜底、重试与状态反馈。',
            '具备跨产品、设计、工程协同推进能力。',
          ],
          niceToHave: [
            '做过求职、知识管理、运营提效等 AI 工作流产品。',
            '有数据复盘和实验优化意识。',
            '能把抽象模型能力讲清楚并转成好用的交互。',
          ],
          implicitRequirements: [
            {
              requirement: '不仅要会调模型，还要能把系统做成真实可用产品',
              reasoning: 'JD 明确强调从 Demo 到生产场景，说明工程稳定性和产品可用性都很重要。',
            },
            {
              requirement: '需要承担一定的产品定义与工作流设计职责',
              reasoning: '岗位职责中多次提到与产品团队共同定义场景边界、成功指标和交互方式。',
            },
          ],
          techKeywords: ['Agent', '工作流', 'Prompt', '工具调用', '结构化输出', '前端工作台'],
          businessKeywords: ['提效', '成功率', '可解释性', '用户体验'],
          cultureKeywords: ['跨团队协作', '主动推进', '问题拆解'],
          idealCandidateProfile:
            '适合一位能够同时理解智能体执行链路与用户工作流体验的复合型工程师，既能搭系统，也能推动真实业务落地。',
          coreCompetencies: ['Agent 设计', '工程落地', '提示词编排', '结果校验', '前端工作台', '跨团队协作'],
          yearsOfExperience: '3 年以上相关经验',
        },
        createdAt: DEMO_TIMESTAMPS.jdAgentCreatedAt,
      },
      {
        id: 'jd_demo_product_manager',
        rawText: `职位名称：AI 产品经理
公司：云帆科技

我们在寻找一位熟悉 AI 工作流产品的产品经理，负责定义从需求洞察、方案设计到数据复盘的完整闭环。你需要理解大模型产品的不确定性，能够与算法、工程和设计同学共同把能力封装成稳定、有价值的功能。

岗位职责：
1. 负责 AI 功能的需求分析、方案设计与迭代规划。
2. 梳理用户旅程、核心场景和关键指标，推动从体验到转化的整体优化。
3. 与工程和算法团队协作，推动功能上线、灰度、实验和复盘。
4. 沉淀产品文档、策略说明和业务判断框架。

岗位要求：
1. 有复杂工作流、SaaS 工具或 AI 产品经验。
2. 具备较强的需求拆解、跨团队沟通和方案推动能力。
3. 有数据分析意识，能基于指标判断迭代方向。
4. 能理解技术实现约束，并将其转化为合理的产品方案。

加分项：
1. 有亲自参与 AI 功能搭建或 Prompt 策略设计经验。
2. 对求职、教育、知识管理等场景有经验。
3. 能写出清晰、可执行的 PRD 与复盘文档。`,
        parsed: {
          company: '云帆科技',
          position: 'AI 产品经理',
          level: '资深',
          location: '杭州 / 上海',
          salaryRange: '30k-45k / 月',
          mustHave: [
            '有复杂工作流、SaaS 工具或 AI 产品经验。',
            '具备需求拆解、跨团队沟通和方案推进能力。',
            '能够基于数据指标判断优化方向。',
            '理解技术实现约束并转换为产品方案。',
          ],
          niceToHave: [
            '参与过 Prompt 策略设计或 AI 功能搭建。',
            '熟悉求职、教育或知识管理类场景。',
            '能够产出清晰的 PRD 与复盘文档。',
          ],
          implicitRequirements: [
            {
              requirement: '需要具备较强的工程理解力，能够和技术团队高效共创',
              reasoning: 'JD 明确强调理解技术约束，并与算法、工程共同推进方案落地。',
            },
            {
              requirement: '更偏结果导向，而不是单纯写文档型产品经理',
              reasoning: '岗位职责强调从需求到实验、复盘和转化优化的完整闭环。',
            },
          ],
          techKeywords: ['AI 产品', '工作流', '指标分析', '灰度实验', 'Prompt 策略'],
          businessKeywords: ['用户旅程', '转化', '复盘', '迭代规划'],
          cultureKeywords: ['共创', '判断力', '推动力'],
          idealCandidateProfile:
            '适合一位偏增长和复杂工作流方向的 AI 产品经理，既能做方案，也能和技术团队一起把方案落地成真实可验证的产品。',
          coreCompetencies: ['需求分析', '产品规划', '数据判断', '跨团队协作', 'AI 场景理解'],
          yearsOfExperience: '3-5 年',
        },
        createdAt: DEMO_TIMESTAMPS.jdPmCreatedAt,
      },
    ],
    matchResults: [
      {
        id: 'mr_demo_agent_engineer',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_agent_engineer',
        scores: {
          technicalFit: 93,
          experienceFit: 90,
          educationFit: 80,
          culturalFit: 88,
          growthPotential: 89,
          overall: 91,
        },
        summary:
          '与 Agent工程师 岗位高度匹配。候选人在 Agent 工作流设计、前端工作台落地、Prompt 编排和状态反馈方面都有直接经验，属于能够较快承担核心模块的人选。',
        requirementMatches: [
          {
            requirement: 'Agent 或多步骤工作流落地经验',
            priority: 'critical',
            status: 'strong_match',
            evidence: '当前在黑森林智能负责简历 Agent 与知识工作流 Agent，直接对应岗位核心场景。',
          },
          {
            requirement: '前端工作台与工具调用链路能力',
            priority: 'critical',
            status: 'strong_match',
            evidence: '既负责工作台体验，也负责工具调用、结构化结果与执行反馈设计。',
          },
          {
            requirement: 'Prompt 设计、失败兜底与重试策略',
            priority: 'important',
            status: 'strong_match',
            evidence: '已有 Prompt 规划、评审与重试机制建设经验，并产出可量化优化结果。',
          },
          {
            requirement: '数据复盘与实验优化意识',
            priority: 'nice_to_have',
            status: 'strong_match',
            evidence: '工作经历中已展示流程完成率、错误重跑率和用户确认率等指标优化。',
          },
        ],
        gaps: [
          {
            missing: '可以进一步突出智能体稳定性治理方法',
            severity: 'low',
            currentState: '已经提到重试和校验，但治理方法论表达还不够系统。',
            targetState: '让面试官快速看到你具备可恢复、可监控、可复盘的 Agent 工程视角。',
            suggestion: '在经历中增加对任务状态机、失败分类、重试条件和人工兜底机制的说明。',
          },
        ],
        resumeStrategy: {
          narrative:
            '把你定位成“能把大模型能力做成真实工作流系统的 Agent工程师”，主线强调工作流拆解、工具调用、前端工作台与稳定性治理，而不是泛泛地说会用 AI。',
          emphasize: [
            'Agent 流程设计与执行链路拆解',
            '工具调用、结构化输出、重试与校验',
            '前端工作台与任务反馈体验',
          ],
          deemphasize: [
            '与智能体无关的通用页面开发内容',
            '没有结果指标支撑的技术罗列',
          ],
        },
        createdAt: DEMO_TIMESTAMPS.matchAgentCreatedAt,
      },
      {
        id: 'mr_demo_product_manager',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_product_manager',
        scores: {
          technicalFit: 78,
          experienceFit: 82,
          educationFit: 80,
          culturalFit: 85,
          growthPotential: 84,
          overall: 81,
        },
        summary:
          '与 AI 产品经理岗位中高匹配。候选人在需求拆解、工作流设计、跨团队协同和数据复盘上具备明显优势，但简历中产品文档产出和产品策略表达仍有补强空间。',
        requirementMatches: [
          {
            requirement: '复杂工作流或 AI 产品经验',
            priority: 'critical',
            status: 'strong_match',
            evidence: '当前和过往经历都围绕工作台、流程设计和 AI 功能落地展开。',
          },
          {
            requirement: '需求拆解与方案推进能力',
            priority: 'critical',
            status: 'strong_match',
            evidence: '已有从需求梳理、流程改版到上线复盘的完整协作经验。',
          },
          {
            requirement: '数据分析与指标判断能力',
            priority: 'important',
            status: 'strong_match',
            evidence: '历次项目中都能给出完成率、激活率和效率改善等结果指标。',
          },
          {
            requirement: 'PRD、策略文档与复盘文档产出',
            priority: 'important',
            status: 'partial_match',
            evidence: '简历中体现了产品协同和方案推进，但尚未明确展示正式文档产出物。',
          },
        ],
        gaps: [
          {
            missing: '产品经理身份标签还不够明确',
            severity: 'medium',
            currentState: '现在的简历更像工程背景强、产品协同能力好的 Agent工程师。',
            targetState: '让招聘方看到你不只是技术参与者，而是能够定义问题、设计方案和推动结果的产品角色。',
            suggestion: '重写经历标题与摘要，增加需求定义、方案评审、指标判断和跨团队推进的表述。',
          },
          {
            missing: '缺少产品文档与策略沉淀的直接证据',
            severity: 'medium',
            currentState: '已有结果导向内容，但缺少 PRD、策略文档、复盘框架等显性产物。',
            targetState: '补足从判断到文档再到执行闭环的完整产品经理画像。',
            suggestion: '补充一条关于 PRD、策略说明或实验复盘模板的实践内容。',
          },
        ],
        resumeStrategy: {
          narrative:
            '把你包装成“懂技术实现约束、又能独立推动 AI 工作流方案落地的产品型人才”，先讲你如何定义问题和判断优先级，再讲你如何与工程团队共同把方案变成结果。',
          emphasize: [
            '需求拆解、用户流程设计和跨团队推动',
            '基于数据指标做版本判断与实验复盘',
            '对 AI 工作流产品的场景理解和落地经验',
          ],
          deemphasize: [
            '过于底层的实现细节',
            '与产品结果无关的纯技术描述',
          ],
        },
        createdAt: DEMO_TIMESTAMPS.matchPmCreatedAt,
      },
    ],
    generatedResumes: [
      {
        id: 'gr_demo_agent_engineer',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_agent_engineer',
        matchResultId: 'mr_demo_agent_engineer',
        strategy: {
          narrative: 'technical',
          language: 'zh',
          length: '1page',
        },
        content: `# 王大猫

Agent工程师

- 上海
- wangdamao.demo@example.com
- github.com/wangdamao-demo
- linkedin.com/in/wangdamao-demo

## 职业摘要

5 年智能应用与工作流产品经验，近 3 年聚焦 Agent 系统与多步骤任务编排。擅长把大模型能力拆解为可执行、可校验、可恢复的业务流程，并通过前端工作台、Prompt 编排与结果反馈设计提升执行成功率和用户可理解性。

## 核心能力

- Agent 工作流设计
- 工具调用与结构化输出
- Prompt 设计与重试策略
- TypeScript 工程化
- 前端工作台与任务反馈
- 数据复盘与流程优化

## 工作经历

### 黑森林智能｜Agent工程师
2024.02 - 至今

- 负责求职与知识工作流 Agent 的设计与落地，覆盖任务拆解、工具调用、前端工作台、结果评审与用户反馈闭环。
- 设计多阶段简历 Agent 流程，将导入、档案结构化、JD 匹配、简历生成拆分为可观测节点，完整流程完成率提升 33%。
- 建立 Prompt 规划、评审与重试机制，显著降低结构化输出错误和空结果比例，错误重跑率下降 41%。
- 与产品和设计共同优化 Agent 任务状态反馈与兜底路径，任务结果确认率提升 24%。

### 星海产品实验室｜高级前端工程师 / 产品协同
2021.03 - 2024.01

- 负责内容与运营工作台的前端实现，并参与需求梳理、埋点口径对齐和版本复盘。
- 主导运营工作台改版，统一任务状态与信息层级，高频任务平均完成时长下降 29%。
- 搭建数据看板与实验复盘机制，目标功能激活率提升 18%。

## 项目经历

### 简历 Agent 工作台｜Agent 方案负责人

- 将旧简历拆为结构化档案，并基于岗位要求完成匹配分析与定向改写。
- 把复杂 AI 能力拆成用户可理解的任务链路，降低流程黑盒感。
- 采用浏览器本地工作区与前端直连模型服务方案，降低服务端数据留存风险。

## 教育背景

浙江大学｜软件工程本科
`,
        createdAt: DEMO_TIMESTAMPS.resumeAgentCreatedAt,
      },
      {
        id: 'gr_demo_product_manager',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_product_manager',
        matchResultId: 'mr_demo_product_manager',
        strategy: {
          narrative: 'growth',
          language: 'zh',
          length: '1page',
        },
        content: `# 王大猫

AI 产品方向候选人 / Agent工程师

- 上海
- wangdamao.demo@example.com
- github.com/wangdamao-demo

## 职业摘要

具备 AI 工作流产品与 Agent 系统落地经验，擅长在工程实现、需求拆解与指标优化之间建立闭环。能够从用户场景出发定义问题，联合设计、工程、算法团队把方案推进成真实上线能力，并基于数据持续优化结果。

## 关键优势

- 复杂工作流与 AI 场景理解
- 需求拆解与方案推进
- 数据分析与实验复盘
- 技术约束理解与协同落地
- Prompt 策略与交互反馈设计

## 工作经历

### 黑森林智能｜Agent工程师
2024.02 - 至今

- 参与定义求职与知识工作流 Agent 的核心场景、执行路径与成功指标，推动多阶段流程从 Demo 走向稳定可用。
- 将导入、结构化、匹配、生成拆为独立节点，并与产品、设计团队共同定义每步反馈和兜底方式，完整流程完成率提升 33%。
- 通过 Prompt 规划、评审与重试机制优化结果可用性，错误重跑率下降 41%。

### 星海产品实验室｜高级前端工程师 / 产品协同
2021.03 - 2024.01

- 深度参与运营工作台需求梳理、版本规划与埋点口径对齐，是工程和产品之间的关键协作角色。
- 主导页面改版与流程优化，高频任务平均完成时长下降 29%，目标功能激活率提升 18%。
- 持续沉淀看板和复盘框架，让迭代从经验判断转向指标驱动。

## 项目经历

### 简历 Agent 工作台

- 面向求职场景设计结构化档案、岗位匹配和定向简历生成闭环。
- 在方案设计中兼顾模型能力边界、用户理解成本与流程完成率。
- 通过本地工作区与前端直连模型服务设计，提升用户对隐私安全的信任感。

## 教育背景

浙江大学｜软件工程本科
`,
        createdAt: DEMO_TIMESTAMPS.resumePmCreatedAt,
      },
    ],
  };
}

function hasMeaningfulWorkspace(snapshot: WorkspaceSnapshot) {
  return Boolean(
    snapshot.profile.name.trim() ||
      snapshot.profile.title.trim() ||
      snapshot.profile.summary.trim() ||
      Object.values(snapshot.profile.contact).some(Boolean) ||
      snapshot.items.length ||
      snapshot.jds.length ||
      snapshot.matchResults.length ||
      snapshot.generatedResumes.length
  );
}

function readStoredSnapshot(key: string): WorkspaceSnapshot | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as WorkspaceSnapshot;
  } catch {
    return null;
  }
}

export function isDemoModeEnabled() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === '1';
}

export function hasDemoWorkspaceBackup() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(DEMO_WORKSPACE_BACKUP_KEY));
}

export function enterDemoMode() {
  if (typeof window === 'undefined') return createDemoWorkspace();

  if (!isDemoModeEnabled()) {
    const currentWorkspace = getWorkspace();

    if (hasMeaningfulWorkspace(currentWorkspace)) {
      window.localStorage.setItem(
        DEMO_WORKSPACE_BACKUP_KEY,
        JSON.stringify(currentWorkspace)
      );
    } else {
      window.localStorage.removeItem(DEMO_WORKSPACE_BACKUP_KEY);
    }
  }

  window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, '1');
  return replaceWorkspace(createDemoWorkspace());
}

export function exitDemoMode() {
  if (typeof window === 'undefined') return resetWorkspace();

  const backup = readStoredSnapshot(DEMO_WORKSPACE_BACKUP_KEY);

  window.localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  window.localStorage.removeItem(DEMO_WORKSPACE_BACKUP_KEY);

  return backup ? replaceWorkspace(backup) : resetWorkspace();
}
