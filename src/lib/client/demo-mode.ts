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
  profileUpdatedAt: '2026-04-14T10:20:00.000Z',
  itemsCreatedAt: '2026-03-02T08:30:00.000Z',
  itemsUpdatedAt: '2026-04-14T10:20:00.000Z',
  jdAgentCreatedAt: '2026-04-09T11:20:00.000Z',
  jdBackendCreatedAt: '2026-04-10T13:10:00.000Z',
  jdIosCreatedAt: '2026-04-11T14:45:00.000Z',
  matchAgentCreatedAt: '2026-04-09T11:36:00.000Z',
  matchBackendCreatedAt: '2026-04-10T13:28:00.000Z',
  matchIosCreatedAt: '2026-04-11T15:02:00.000Z',
  resumeAgentCreatedAt: '2026-04-09T11:50:00.000Z',
  resumeBackendCreatedAt: '2026-04-10T13:46:00.000Z',
  resumeIosCreatedAt: '2026-04-11T15:18:00.000Z',
} as const;

function createDemoWorkspace(): WorkspaceSnapshot {
  const skillPythonId = 'sk_demo_python';
  const skillGolangId = 'sk_demo_golang';
  const skillAgentId = 'sk_demo_agent';
  const skillMLOpsId = 'sk_demo_mlops';
  const skillQuantId = 'sk_demo_quant';
  const skillTradingId = 'sk_demo_trading';
  const skillForecastId = 'sk_demo_forecast';
  const skillStorageId = 'sk_demo_storage';
  const skillInfraId = 'sk_demo_infra';
  const skillProductId = 'sk_demo_product';

  return {
    version: 1,
    profile: {
      id: PROFILE_DEFAULT_ID,
      name: 'keyork',
      title: 'AI Agent 平台工程师 / 算法工程师',
      summary:
        '3 年以上 AI 工程化与能源算法经验，持续参与 Agent 平台、量化交易、负荷预测、储能控制和仿真基础设施建设。擅长用 Python 与 Golang 处理从算法研发、系统抽象到生产交付的完整链路，也能承担业务系统设计与跨团队落地。',
      contact: {
        email: 'chengky18@icloud.com',
        phone: '20260417',
        location: '北京',
        website: 'https://keyork.github.io/',
        linkedin: '',
        github: 'https://github.com/keyork',
      },
      createdAt: DEMO_TIMESTAMPS.profileCreatedAt,
      updatedAt: DEMO_TIMESTAMPS.profileUpdatedAt,
    },
    items: [
      {
        id: skillPythonId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: 'Python 工程化',
        category: 'programming_language',
        level: 5,
        yearsOfExperience: 3,
        lastUsed: '2026-04',
        keywords: ['Python', 'JAX', 'NumPy', 'PyTorch', '特征工程', '算法服务'],
        notes: '长期作为算法研发、自动建模和生产系统集成的主力语言。',
      },
      {
        id: skillGolangId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 1,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: 'Golang 系统开发',
        category: 'programming_language',
        level: 4,
        yearsOfExperience: 3,
        lastUsed: '2026-04',
        keywords: ['Golang', '高并发调度', 'gRPC', 'Protobuf', '实时系统'],
      },
      {
        id: skillAgentId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 2,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: 'AI Agent 平台',
        category: 'framework',
        level: 5,
        yearsOfExperience: 1,
        lastUsed: '2026-04',
        keywords: ['Agent', 'Skills', 'Tools', '工作流编排', '自动建模', 'LLM'],
        notes: '负责企业级自动建模 Agent 平台、执行链路设计与能力接入。',
      },
      {
        id: skillMLOpsId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 3,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: 'MLOps 与部署工程',
        category: 'devops',
        level: 4,
        yearsOfExperience: 3,
        lastUsed: '2026-04',
        keywords: ['Docker', 'K8s', 'MLflow', '热更新', '版本回滚', '模型部署'],
      },
      {
        id: skillQuantId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 4,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: '量化因子基础设施',
        category: 'domain_knowledge',
        level: 4,
        yearsOfExperience: 3,
        lastUsed: '2026-03',
        keywords: ['因子挖掘', '现货交易', '回测', '自动交易', '策略评估'],
      },
      {
        id: skillTradingId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 5,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: '电力现货交易',
        category: 'domain_knowledge',
        level: 4,
        yearsOfExperience: 3,
        lastUsed: '2025-12',
        keywords: ['电力现货', '代理交易', '报价策略', '风险控制', '交易运营'],
      },
      {
        id: skillForecastId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 6,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: '负荷预测算法',
        category: 'domain_knowledge',
        level: 4,
        yearsOfExperience: 2,
        lastUsed: '2025-12',
        keywords: ['负荷预测', '光伏预测', '偏差归因', '趋势分析'],
      },
      {
        id: skillStorageId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 7,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: '储能控制与仿真',
        category: 'domain_knowledge',
        level: 4,
        yearsOfExperience: 2,
        lastUsed: '2025-11',
        keywords: ['储能控制', '调频', '仿真平台', 'Modbus', '硬件在环'],
      },
      {
        id: skillInfraId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 8,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: '分布式通信与系统抽象',
        category: 'tool',
        level: 4,
        yearsOfExperience: 3,
        lastUsed: '2026-04',
        keywords: ['gRPC', 'Protobuf', 'Redis', '数据交换', '接口抽象', '运行时切换'],
      },
      {
        id: skillProductId,
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 9,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'skill',
        name: '业务系统设计与产品化交付',
        category: 'management',
        level: 4,
        yearsOfExperience: 3,
        lastUsed: '2026-04',
        keywords: ['需求分析', '系统架构设计', '多维看板', '交互优化', '路演表达'],
      },
      {
        id: 'exp_demo_geo_infra',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'experience',
        company: '地球科技有限公司',
        title: '开发部 基础设施组',
        startDate: '2026-01',
        endDate: undefined,
        isCurrent: true,
        location: '北京',
        description:
          '负责企业级自动建模 Agent 平台、内部 Tools 工程化体系以及交易生产系统的架构设计与交付，核心目标是把算法能力沉淀为可复用的平台与业务系统。',
        achievements: [
          {
            id: 'ach_demo_geo_infra_1',
            description: '推动企业级自动建模 Agent 平台从零到生产落地，建立面向建模全生命周期的执行链路与能力边界。',
            metrics: { type: 'efficiency', value: 80, unit: '%', context: '算法从实验验证到可交付周期缩短' },
          },
          {
            id: 'ach_demo_geo_infra_2',
            description: '抽象内部 Tools 与文档规范，形成标准化接入方式，支撑 Agent 平台与业务系统持续扩展。',
          },
          {
            id: 'ach_demo_geo_infra_3',
            description: '兼任产品设计与技术研发，完成综合交易生产及测算系统的需求分析、系统架构设计和全栈交付。',
          },
        ],
        relatedSkills: [skillPythonId, skillAgentId, skillMLOpsId, skillProductId],
        industryTags: ['AI 平台', '基础设施', '业务系统'],
      },
      {
        id: 'exp_demo_geo_algo',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 1,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'experience',
        company: '地球科技有限公司',
        title: '算法部',
        startDate: '2023-03',
        endDate: '2025-12',
        isCurrent: false,
        location: '北京',
        description:
          '负责电力交易、负荷预测、储能控制及相关基础设施研发，覆盖算法、实时系统、模拟测算平台和生产级产品交付。',
        achievements: [
          {
            id: 'ach_demo_geo_algo_1',
            description: '量化挖因子、自动交易、负荷预测和储能控制均形成过可上线或可交付的完整方案，而非单点算法实验。',
          },
          {
            id: 'ach_demo_geo_algo_2',
            description: '多个项目同时覆盖算法研发、系统架构和工程部署，具备从模型到系统的完整交付能力。',
          },
          {
            id: 'ach_demo_geo_algo_3',
            description: '在能源业务的高时效、高可靠场景下持续迭代系统，沉淀出可迁移的工程方法与领域理解。',
          },
        ],
        relatedSkills: [skillPythonId, skillGolangId, skillQuantId, skillTradingId, skillForecastId, skillStorageId],
        industryTags: ['电力交易', '负荷预测', '储能', '自动化系统'],
      },
      {
        id: 'exp_demo_lab',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 2,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'experience',
        company: '清华大学电子工程系 XXX实验室',
        title: '研究助理',
        startDate: '2020-03',
        endDate: '2023-07',
        isCurrent: false,
        location: '北京',
        description:
          '参与环境治理、边缘多媒体平台和低算力目标跟踪等研究工作，覆盖算法设计、系统适配、资源调度和产品化交付支持。',
        achievements: [
          {
            id: 'ach_demo_lab_1',
            description: '围绕污染传输、多媒体平台和边缘跟踪三个方向，持续积累算法与系统联动经验。',
          },
          {
            id: 'ach_demo_lab_2',
            description: '在低算力设备和多源传感场景中处理真实资源约束问题，为后续工程化能力打下基础。',
          },
        ],
        relatedSkills: [skillPythonId, skillInfraId, skillProductId],
        industryTags: ['科研', '边缘计算', '环境感知'],
      },
      {
        id: 'prj_demo_agent_platform',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '企业级自动建模 Agent 平台',
        role: '核心搭建者',
        description:
          '从零搭建面向算法建模全生命周期的企业级 AI Agent 平台，覆盖 EDA、特征工程、模型训练、超参优化、代码规范化、数据泄露检测、持续优化以及模型与 Docker 镜像导出。',
        techStack: ['Python', 'Claude Code', 'OpenCode', 'Skills', 'Docker', 'MLflow'],
        achievements: [
          {
            id: 'ach_demo_prj_agent_1',
            description: '基于 Claude Code / OpenCode、自研 Skills 体系及内部 Tools 构建端到端 Agent 工作流。',
            metrics: { type: 'efficiency', value: 80, unit: '%', context: '算法迭代周期缩短' },
          },
          {
            id: 'ach_demo_prj_agent_2',
            description: '持续优化 Skills 与 Tools 编排策略，在保持同等建模效果前提下，单任务 Token 消耗降低约 30%。',
            metrics: { type: 'efficiency', value: 30, unit: '%', context: '单任务 Token 消耗下降' },
          },
        ],
        relatedSkills: [skillPythonId, skillAgentId, skillMLOpsId],
        startDate: '2026-01',
        endDate: '2026-04',
      },
      {
        id: 'prj_demo_internal_tools',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 1,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '企业内部 Tools 工程化体系',
        role: '标准化设计与落地',
        description:
          '将数据获取、模型评测等核心能力抽象为标准化 CLI 工具链，统一接口规范、调用协议及文档体系，并沉淀 Agent Skills 描述标准。',
        techStack: ['Python', 'CLI', 'API', '文档规范', 'Skills'],
        achievements: [
          {
            id: 'ach_demo_prj_tools_1',
            description: '实现内部能力的即插即用式接入，显著降低新工具接入成本。',
          },
          {
            id: 'ach_demo_prj_tools_2',
            description: '为后续 Agent 平台能力扩展和工程化演进奠定统一接口基础。',
          },
        ],
        relatedSkills: [skillPythonId, skillAgentId, skillInfraId],
        startDate: '2026-01',
        endDate: '2026-04',
      },
      {
        id: 'prj_demo_trade_ops',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 2,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '综合交易生产及测算系统',
        role: '产品设计与技术研发',
        description:
          '完成交易部综合生产系统与事后复盘测算系统的需求分析、系统架构设计及全栈交付，打通策略上线、执行监控与事后评估闭环。',
        techStack: ['MLflow', 'K8s', '可视化看板', '全栈交付'],
        achievements: [
          {
            id: 'ach_demo_prj_trade_ops_1',
            description: '基于 MLflow + K8s 构建模型部署、热更新与版本回滚体系，支撑策略模型快速迭代和生产稳定运行。',
          },
          {
            id: 'ach_demo_prj_trade_ops_2',
            description: '围绕交易员决策流程搭建多维看板和复盘分析能力，项目按期交付并投入生产。',
          },
        ],
        relatedSkills: [skillMLOpsId, skillProductId, skillTradingId],
        startDate: '2026-01',
        endDate: '2026-04',
      },
      {
        id: 'prj_demo_factor_mining',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 3,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '电力交易量化挖因子框架',
        role: '核心研发',
        description:
          '搭建面向电力现货量化交易的新一代因子挖掘引擎，表达层基于 AST 实现因子结构化生成、变异与组合，计算层构建 JAX / NumPy / Torch 混合执行引擎。',
        techStack: ['Python', 'JAX', 'NumPy', 'PyTorch', 'AST'],
        achievements: [
          {
            id: 'ach_demo_prj_factor_1',
            description: '生成层融合遗传算法与 LLM 辅助因子创意生成，突破传统人工挖因子的搜索空间瓶颈。',
          },
          {
            id: 'ach_demo_prj_factor_2',
            description: '整体计算效率较上一代纯 Torch 框架提升 40%，成为交易部门核心基础设施。',
            metrics: { type: 'efficiency', value: 40, unit: '%', context: '计算效率提升' },
          },
        ],
        relatedSkills: [skillPythonId, skillQuantId],
        startDate: '2023-06',
        endDate: '2025-12',
      },
      {
        id: 'prj_demo_spot_ops',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 4,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '电力现货代理交易运营',
        role: '独立负责',
        description:
          '独立负责多个新能源场站及售电公司的电力现货代理交易全流程运营，在高时效强约束业务场景中沉淀市场规则理解、报价策略设计与风险控制经验。',
        techStack: ['交易策略', '业务运营', '风险控制'],
        achievements: [
          {
            id: 'ach_demo_prj_spot_ops_1',
            description: '连续 8 个月无休完成每日早间交易策略申报，实现关键交易窗口零遗漏、零延误、零事故。',
            metrics: { type: 'quality', value: 8, unit: '个月', context: '连续稳定执行' },
          },
        ],
        relatedSkills: [skillTradingId, skillQuantId],
        startDate: '2023-04',
        endDate: '2024-01',
      },
      {
        id: 'prj_demo_auto_trading',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 5,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '滚动撮合实时自动交易系统',
        role: '主导建设',
        description:
          '主导建设电力交易滚动撮合场景下的全自动盯盘与交易系统，针对交易中心 5 秒行情推送与 5 秒操作频控的强约束环境，实现毫秒级策略决策与高鲁棒状态同步。',
        techStack: ['Golang', 'Python', 'Casdoor', '实时系统'],
        achievements: [
          {
            id: 'ach_demo_prj_auto_trading_1',
            description: '采用 Golang 高并发调度 + Python 策略计算混合架构，实现安全可控的无人值守交易。',
          },
        ],
        relatedSkills: [skillGolangId, skillPythonId, skillTradingId, skillInfraId],
        startDate: '2023-08',
        endDate: '2024-06',
      },
      {
        id: 'prj_demo_sim_pricing',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 6,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '电力现货模拟测算平台',
        role: '设计与落地',
        description:
          '面向商务获客场景，设计并落地端到端电力现货模拟测算平台，自动完成交易中心数据下载、持仓反解、现货损益精算、算法收益对比模拟及汇报材料生成。',
        techStack: ['Python', '数据处理', '报告生成', '业务系统'],
        achievements: [
          {
            id: 'ach_demo_prj_sim_pricing_1',
            description: '将客户试用测算全流程周期由 15 天压缩至 2 天，显著提升商务转化效率。',
            metrics: { type: 'efficiency', value: 87, unit: '%', context: '试算周期压缩' },
          },
        ],
        relatedSkills: [skillPythonId, skillTradingId, skillProductId],
        startDate: '2024-02',
        endDate: '2024-10',
      },
      {
        id: 'prj_demo_load_box',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 7,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '省网级用电负荷预测一体机（已上线生产）',
        role: '核心算法研发与工程交付',
        description:
          '负责某省全网负荷预测核心算法研发与工程化交付，完成国产服务器与国产操作系统环境下的 Docker 容器化适配及性能调优。',
        techStack: ['Python', 'Docker', '国产化部署', '负荷预测'],
        achievements: [
          {
            id: 'ach_demo_prj_load_box_1',
            description: '算法侧持续迭代负荷预测模型，综合准确率稳定在 98%+。',
            metrics: { type: 'quality', value: 98, unit: '%', context: '综合预测准确率' },
          },
          {
            id: 'ach_demo_prj_load_box_2',
            description: '产品通过网安等保检测后部署至省网公司安全二区生产环境，稳定运行 12 个月零事故。',
            metrics: { type: 'quality', value: 12, unit: '个月', context: '生产稳定运行' },
          },
        ],
        relatedSkills: [skillPythonId, skillForecastId, skillMLOpsId],
        startDate: '2024-01',
        endDate: '2025-08',
      },
      {
        id: 'prj_demo_load_forecast',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 8,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '省域用电负荷预测算法',
        role: '研发负责人',
        description:
          '研发覆盖日前及中长期场景的省域负荷预测模型，构建包含精准预测与偏差归因分析的完整方法体系。',
        techStack: ['Python', '时间序列', '归因分析'],
        achievements: [
          {
            id: 'ach_demo_prj_load_forecast_1',
            description: '推动公司参与国网区域多厂商联合评测排名由中游偏后提升至全场前四，其中两周取得榜首成绩。',
          },
        ],
        relatedSkills: [skillPythonId, skillForecastId],
        startDate: '2023-09',
        endDate: '2025-02',
      },
      {
        id: 'prj_demo_load_product',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 9,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '全省负荷预测产品',
        role: '主导设计与开发',
        description:
          '主导全省负荷预测产品设计与开发，覆盖历史数据分析、多维展示、预测结果呈现、趋势解读、预测复盘、精度追踪、偏差归因及负荷变化驱动分析等完整功能链路。',
        techStack: ['产品设计', '数据看板', '全栈开发'],
        achievements: [
          {
            id: 'ach_demo_prj_load_product_1',
            description: '以调度用户视角重构交互流程，持续提升决策效率与产品可用性。',
          },
        ],
        relatedSkills: [skillForecastId, skillProductId],
        startDate: '2024-03',
        endDate: '2025-07',
      },
      {
        id: 'prj_demo_pv_forecast',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 10,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '省域分布式光伏预测',
        role: '算法研发',
        description:
          '研发省域分布式光伏出力预测算法，并与东南沿海某省省网公司完成合作落地。',
        techStack: ['Python', '光伏预测', '时间序列'],
        achievements: [
          {
            id: 'ach_demo_prj_pv_forecast_1',
            description: '综合准确率较基线方案提升 10 个百分点。',
            metrics: { type: 'quality', value: 10, unit: '个百分点', context: '相对基线提升' },
          },
        ],
        relatedSkills: [skillPythonId, skillForecastId],
        startDate: '2024-05',
        endDate: '2025-03',
      },
      {
        id: 'prj_demo_storage_algo',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 11,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '混合储能智能控制算法',
        role: '核心研发',
        description:
          '搭建覆盖独立储能调频、火储联合调频等多场景的混合储能控制算法体系，统一优化短期收益最大化与考虑电池寿命衰减的长期综合回报率。',
        techStack: ['Python', '控制算法', '调频优化'],
        achievements: [
          {
            id: 'ach_demo_prj_storage_algo_1',
            description: '实现火储联合调频场景下综合收益提升 30%，AGC 指令成功响应率提升 10%。',
            metrics: { type: 'growth', value: 30, unit: '%', context: '综合收益提升' },
          },
        ],
        relatedSkills: [skillPythonId, skillStorageId],
        startDate: '2024-01',
        endDate: '2025-11',
      },
      {
        id: 'prj_demo_storage_sim',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 12,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '混合储能高保真模拟器',
        role: '设计与实现',
        description:
          '设计并实现融合机理建模与实测数据校正的高保真混合储能模拟器，为控制算法开发、调参与验证提供仿真环境。',
        techStack: ['Golang', 'gRPC', 'Protobuf', '仿真'],
        achievements: [
          {
            id: 'ach_demo_prj_storage_sim_1',
            description: '支持飞轮、超级电容、锂电等多类型储能并行仿真及算法包热插拔接入。',
          },
        ],
        relatedSkills: [skillGolangId, skillStorageId, skillInfraId],
        startDate: '2024-04',
        endDate: '2025-06',
      },
      {
        id: 'prj_demo_grid_sim',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 13,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '局部电网仿真与半实物仿真实验平台',
        role: '平台搭建',
        description:
          '面向某发电集团揭榜挂帅项目，搭建局部电网实时仿真工具，依据储能出力动态模拟电网频率响应并驱动硬件在环测试。',
        techStack: ['Golang', 'Modbus', 'Protobuf', 'gRPC'],
        achievements: [
          {
            id: 'ach_demo_prj_grid_sim_1',
            description: '平台预设多种标准测试模式，覆盖独立储能一次 / 二次调频国标测试及区域 AGC 指令模拟。',
          },
        ],
        relatedSkills: [skillGolangId, skillStorageId, skillInfraId],
        startDate: '2024-06',
        endDate: '2025-09',
      },
      {
        id: 'prj_demo_storage_station',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 14,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '独立混合储能电站控制系统',
        role: '控制算法设计',
        description:
          '设计并实现飞轮、超级电容、锂电三类异构储能单元协调控制算法，完成与合作方控制系统的接口联调。',
        techStack: ['控制算法', '接口联调', '储能'],
        achievements: [
          {
            id: 'ach_demo_prj_storage_station_1',
            description: '系统已运行于某发电集团独立储能电站，承担实际调频生产任务。',
          },
        ],
        relatedSkills: [skillStorageId],
        startDate: '2024-08',
        endDate: '2025-11',
      },
      {
        id: 'prj_demo_data_exchange',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 15,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '分布式模拟器数据交换架构设计',
        role: '架构设计',
        description:
          '面向城市级大规模模拟器场景，设计适配不同计算规模的底层数据交换架构，评估 Redis 与 Protobuf + gRPC 两种模式在不同数据规模下的吞吐、延迟与资源开销。',
        techStack: ['Redis', 'Protobuf', 'gRPC', '性能分析'],
        achievements: [
          {
            id: 'ach_demo_prj_data_exchange_1',
            description: '定位架构切换性能拐点，并实现基于运行时数据规模的自适应封装策略切换模块。',
          },
        ],
        relatedSkills: [skillInfraId, skillGolangId],
        startDate: '2024-07',
        endDate: '2024-12',
      },
      {
        id: 'prj_demo_expo',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 16,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '2024 世界智能产业博览会路演',
        role: '公司代表 / 方案表达负责人',
        description:
          '作为公司代表参与 2024 世界智能产业博览会 BP 路演，主导展示材料搭建、商业逻辑梳理、叙事框架设计及现场汇报全流程。',
        techStack: ['商业表达', '方案设计', '路演'],
        achievements: [
          {
            id: 'ach_demo_prj_expo_1',
            description: '围绕公司 AI 核心能力、行业场景、客户价值与商业模式构建完整对外表达体系。',
          },
        ],
        relatedSkills: [skillProductId, skillAgentId],
        startDate: '2024-09',
        endDate: '2024-09',
      },
      {
        id: 'prj_demo_pollution',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 17,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '基于传感网的污染事件提取与传输分析',
        role: '研究参与者',
        description:
          '基于多源传感器网络构建污染事件识别与跨区域传输路径分析框架，将任务建模为异常检测问题，并进一步构建因果检验驱动的污染传输路径挖掘方法。',
        techStack: ['异常检测', '因果检验', '传感网络'],
        achievements: [
          {
            id: 'ach_demo_prj_pollution_1',
            description: '实现污染事件与设备故障有效解耦，并在预测任务中验证因果路径有效性。',
          },
        ],
        relatedSkills: [skillPythonId],
        startDate: '2020-03',
        endDate: '2021-06',
      },
      {
        id: 'prj_demo_media_platform',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 18,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '多媒体信息处理微型化平台项目',
        role: '系统研发与交付',
        description:
          '深度参与多媒体信息处理微型化平台研发与交付全流程，覆盖技术选型、系统架构设计、模块调度优化、产品集成、测试交付及现场答辩。',
        techStack: ['Android', 'Raspberry Pi', 'Speex', '边缘设备'],
        achievements: [
          {
            id: 'ach_demo_prj_media_platform_1',
            description: '在树莓派低算力环境下完成 Android 系统适配，优化资源调度与内存管理模块。',
          },
          {
            id: 'ach_demo_prj_media_platform_2',
            description: '推动系统从实验原型演进为支持开机自启动、开箱即用的产品化方案。',
          },
        ],
        relatedSkills: [skillProductId, skillInfraId],
        startDate: '2021-01',
        endDate: '2022-08',
      },
      {
        id: 'prj_demo_tracking',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 19,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'project',
        name: '智能节点的互惠协同及其行为机理研究',
        role: '国家自然基金项目参与者',
        description:
          '研究面向低算力边缘设备的实时鲁棒行人多目标跟踪方案，针对资源约束优化孪生网络跟踪算法，提出前后台双模式跟踪方案。',
        techStack: ['目标检测', 'ReID', '边缘计算'],
        achievements: [
          {
            id: 'ach_demo_prj_tracking_1',
            description: '显著提升镜头抖动与遮挡场景下的目标保持能力，解决基线模型频繁丢失目标的问题。',
          },
        ],
        relatedSkills: [skillPythonId],
        startDate: '2021-06',
        endDate: '2023-07',
      },
      {
        id: 'edu_demo_thu',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'education',
        school: '清华大学',
        degree: '本科',
        major: '电子信息科学与技术',
        startDate: '2018-08',
        endDate: '2023-06',
        highlights: ['2020 MCM/ICM Meritorious Winner', '全国大学生物理竞赛一等奖', '城市认知智能挑战赛全国第三名'],
      },
      {
        id: 'cert_demo_cet4',
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: 0,
        source: 'ai_confirmed',
        createdAt: DEMO_TIMESTAMPS.itemsCreatedAt,
        updatedAt: DEMO_TIMESTAMPS.itemsUpdatedAt,
        type: 'certification',
        name: '英语（CET-4）',
        issuer: '教育部教育考试院',
        issueDate: '2021-06',
        credentialId: 'CET4-DEMO',
        relatedSkills: [],
      },
    ],
    jds: [
      {
        id: 'jd_demo_agent_platform',
        rawText: `AI Agent 平台工程师

公司：三体智能科技有限公司

岗位职责：
1. 负责企业级 AI Agent 平台的架构设计与核心研发，支撑多场景 Agent 工作流的生产落地
2. 设计 Agent 的 Skills 与 Tools 编排体系，实现企业内部能力的标准化接入与动态调度
3. 构建 Agent 任务执行引擎，覆盖任务拆解、工具调用、上下文管理、异常恢复等核心链路
4. 持续优化 Agent 推理成本与执行效率，包括 Token 消耗控制、调用链路精简、缓存策略设计
5. 将数据获取、评测、部署等企业内部能力抽象为标准化工具链（CLI / API），统一接口规范与文档体系
6. 与算法、业务团队协作，推动 Agent 从 POC 验证到规模化生产的完整落地

岗位要求：
1. 计算机、电子信息等相关专业本科及以上学历
2. 2 年以上 AI 工程化经验，有 Agent / LLM 应用平台建设经验优先
3. 熟练掌握 Python，熟悉 Golang 或 TypeScript 加分
4. 熟悉主流 LLM API 调用与 Agent 框架（如 LangChain、Claude Code、OpenAI Function Calling 等）
5. 熟悉容器化部署（Docker / K8s），有 MLOps 或模型服务化经验优先
6. 具备良好的系统抽象与工程化能力，能独立完成从技术方案设计到生产交付的全流程
7. 有实际 Agent 生产落地案例者优先，而非仅限于 Demo 阶段`,
        parsed: {
          company: '三体智能科技有限公司',
          position: 'AI Agent 平台工程师',
          level: '高级',
          location: '未注明',
          salaryRange: '未注明',
          mustHave: [
            '2 年以上 AI 工程化经验。',
            '有 Agent / LLM 应用平台建设经验。',
            '熟练掌握 Python，熟悉 Golang 或 TypeScript。',
            '熟悉主流 LLM API 调用与 Agent 框架。',
            '熟悉 Docker / K8s 与模型服务化。',
          ],
          niceToHave: [
            '有 Skills 与 Tools 编排体系建设经验。',
            '有标准化工具链（CLI / API）抽象经验。',
            '有从 POC 到规模化生产落地的案例。',
          ],
          implicitRequirements: [
            {
              requirement: '需要同时处理平台抽象、执行链路与组织内能力接入',
              reasoning: 'JD 不只要求会调模型，还强调执行引擎、工具标准化和跨团队落地。',
            },
            {
              requirement: '更看重真实生产落地，而不是停留在 Demo 阶段',
              reasoning: '岗位要求明确写了优先考虑有实际 Agent 生产落地案例的人选。',
            },
          ],
          techKeywords: ['Agent', 'Skills', 'Tools', 'Python', 'Golang', 'Docker', 'K8s', 'LLM API'],
          businessKeywords: ['生产落地', '推理成本', '执行效率', '工具标准化'],
          cultureKeywords: ['系统抽象', '工程化', '跨团队协作'],
          idealCandidateProfile:
            '适合有真实 Agent 平台交付经验的 AI 工程师，既能搭建平台与执行链路，也能把企业内部能力标准化接入并推动到生产环境。',
          coreCompetencies: ['Agent 平台', 'Tools/Skills 编排', '执行引擎', 'LLM 工程化', 'MLOps', '生产交付'],
          yearsOfExperience: '2 年以上',
        },
        createdAt: DEMO_TIMESTAMPS.jdAgentCreatedAt,
      },
      {
        id: 'jd_demo_data_platform_backend',
        rawText: `高级后端工程师（数据平台方向）

公司：三体技术科技有限公司

岗位职责：
1. 负责公司数据平台核心服务的架构设计与开发，支撑日均百亿级数据处理
2. 设计高可用、高吞吐的数据管道，覆盖数据采集、清洗、存储、查询全链路
3. 优化 Spark/Flink 大数据计算任务性能，降低资源开销
4. 建设数据质量监控与异常告警体系
5. 参与数据中台能力建设，推动数据资产标准化

岗位要求：
1. 计算机相关专业本科及以上学历，5 年以上后端开发经验
2. 精通 Java 或 Scala，熟悉 Spring Boot / Spring Cloud 微服务体系
3. 深入理解分布式系统原理，熟悉 Kafka、Redis、Elasticsearch 等中间件
4. 有 Spark / Flink / Hive 等大数据技术栈实战经验
5. 熟悉 MySQL / ClickHouse / Doris 等 OLAP 引擎
6. 有数据平台或数据中台建设经验优先
7. 良好的沟通协作能力，能推动跨团队技术方案落地`,
        parsed: {
          company: '三体技术科技有限公司',
          position: '高级后端工程师（数据平台方向）',
          level: '高级',
          location: '未注明',
          salaryRange: '未注明',
          mustHave: [
            '5 年以上后端开发经验。',
            '精通 Java 或 Scala，熟悉 Spring 微服务体系。',
            '熟悉 Kafka、Redis、Elasticsearch 等中间件。',
            '有 Spark / Flink / Hive 等大数据栈实战经验。',
            '熟悉 OLAP 引擎与数据平台建设。',
          ],
          niceToHave: [
            '有高吞吐数据管道与数据质量体系建设经验。',
            '参与过数据中台或数据资产标准化项目。',
            '能够推动跨团队技术方案落地。',
          ],
          implicitRequirements: [
            {
              requirement: '岗位更偏成熟数据基础设施建设，而非算法原型系统',
              reasoning: 'JD 核心聚焦数据平台、数据管道和大数据计算链路，并非模型业务本身。',
            },
            {
              requirement: '候选人需要具备标准大数据栈与企业级后端体系经验',
              reasoning: 'Java/Scala、Spring、Spark/Flink、OLAP 都是明确硬门槛。',
            },
          ],
          techKeywords: ['Java', 'Scala', 'Spring Boot', 'Kafka', 'Redis', 'Elasticsearch', 'Spark', 'Flink'],
          businessKeywords: ['数据平台', '高吞吐', '数据资产', '数据质量'],
          cultureKeywords: ['跨团队协作', '架构设计', '稳定性'],
          idealCandidateProfile:
            '适合长期在数据平台或大数据基础设施方向深耕的高级后端工程师，能够处理大规模数据链路和标准化平台建设。',
          coreCompetencies: ['后端架构', '大数据计算', '数据管道', '中间件', '数据平台'],
          yearsOfExperience: '5 年以上',
        },
        createdAt: DEMO_TIMESTAMPS.jdBackendCreatedAt,
      },
      {
        id: 'jd_demo_ios',
        rawText: `高级 iOS 开发工程师

公司：三体科技有限公司

岗位职责：
1. 负责核心社交产品 iOS 客户端架构设计与性能优化
2. 主导音视频通话、直播连麦等实时通信模块开发
3. 推动 SwiftUI 技术栈迁移，建设组件化 UI 框架
4. 优化 App 启动速度、内存占用、卡顿率等核心体验指标
5. 参与跨端技术方案评估（Flutter/RN），推动效率工具建设

岗位要求：
1. 计算机相关专业本科及以上学历，5 年以上 iOS 开发经验
2. 精通 Swift / Objective-C，深入理解 iOS Runtime 机制
3. 熟悉 AVFoundation、WebRTC 等音视频技术栈
4. 有大规模 App 性能优化经验（启动、渲染、内存、网络）
5. 熟悉 iOS 组件化架构，有模块化拆分与动态化方案实践经验
6. 有 App Store 审核策略经验，熟悉 Apple 生态规范
7. 有社交、直播或通信类产品开发经验优先`,
        parsed: {
          company: '三体科技有限公司',
          position: '高级 iOS 开发工程师',
          level: '高级',
          location: '未注明',
          salaryRange: '未注明',
          mustHave: [
            '5 年以上 iOS 开发经验。',
            '精通 Swift / Objective-C 与 iOS Runtime。',
            '熟悉 AVFoundation、WebRTC 等音视频技术栈。',
            '有 App 性能优化和组件化架构实践。',
            '熟悉 Apple 生态与 App Store 审核规范。',
          ],
          niceToHave: [
            '有 Flutter 或 React Native 等跨端评估经验。',
            '有社交、直播或通信类产品经验。',
            '能推动效率工具建设。',
          ],
          implicitRequirements: [
            {
              requirement: '需要非常强的原生移动端深度经验，且要能承担核心架构责任',
              reasoning: '岗位职责从架构设计到性能优化、实时通信均指向成熟 iOS 核心开发者。',
            },
            {
              requirement: '业务背景更偏社交和音视频场景',
              reasoning: 'JD 重点围绕直播、连麦、通信和 Apple 生态规范。',
            },
          ],
          techKeywords: ['iOS', 'Swift', 'Objective-C', 'SwiftUI', 'AVFoundation', 'WebRTC'],
          businessKeywords: ['社交产品', '直播', '实时通信', '性能体验'],
          cultureKeywords: ['架构能力', '终端体验', '效率工具'],
          idealCandidateProfile:
            '适合在 iOS 客户端、音视频和性能优化方向有多年沉淀的移动端核心工程师。',
          coreCompetencies: ['iOS 架构', '音视频', '性能优化', '组件化', 'Apple 生态'],
          yearsOfExperience: '5 年以上',
        },
        createdAt: DEMO_TIMESTAMPS.jdIosCreatedAt,
      },
    ],
    matchResults: [
      {
        id: 'mr_demo_agent_platform',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_agent_platform',
        scores: {
          technicalFit: 96,
          experienceFit: 95,
          educationFit: 88,
          culturalFit: 91,
          growthPotential: 93,
          overall: 94,
        },
        summary:
          '与 AI Agent 平台工程师岗位高度匹配，是 JD 描述的”有实际 Agent 生产落地案例”的强匹配人选。候选人已有企业级 Agent 平台从零到生产落地的完整经历，Skills / Tools 编排、推理成本优化（Token -30%）、标准化工具链和 MLOps 生产部署体系均有直接项目证明。技术语言（Python / Golang）和工程化能力与岗位全面对齐，属于可立即承担核心平台模块的即战力候选人。',
        requirementMatches: [
          {
            requirement: '企业级 AI Agent 平台架构与核心研发',
            priority: 'critical',
            status: 'strong_match',
            evidence: '”企业级自动建模 Agent 平台”从零搭建并推动生产落地，覆盖 EDA、特征工程、模型训练、超参优化、数据泄露检测到 Docker 镜像导出的建模全生命周期，并已形成可复用的端到端 Agent 工作流——不是停留在 Demo 阶段的概念验证。',
          },
          {
            requirement: 'Skills 与 Tools 编排体系设计，实现内部能力标准化接入',
            priority: 'critical',
            status: 'strong_match',
            evidence: '”企业内部 Tools 工程化体系”项目将数据获取、评测等核心能力抽象为标准化 CLI / API 工具链，沉淀了 Skills 描述规范与能力接入约束，实现内部能力从”人工触发”到”可编排 Agent 模块”的演进——与 JD”设计 Skills / Tools 编排体系，实现企业内部能力标准化接入与动态调度”直接对应。',
          },
          {
            requirement: 'Agent 推理成本与执行效率持续优化',
            priority: 'critical',
            status: 'strong_match',
            evidence: '档案明确记录”在保持同等建模效果前提下，单任务 Token 消耗降低约 30%”，体现了 JD 所要求的 Token 消耗控制与调用链路精简能力，属于有量化结果的生产级推理成本优化实践，而非理论认知。',
          },
          {
            requirement: '熟悉主流 LLM API 调用与 Agent 框架',
            priority: 'important',
            status: 'strong_match',
            evidence: '档案使用了 Claude Code / OpenCode 作为 Agent 执行框架并自研 Skills 体系，属于生产级 LLM Agent 框架实战；虽然 LangChain、OpenAI Function Calling 等框架名称未显式列出，但整体框架设计深度已超出单纯调用 API 的水平。',
          },
          {
            requirement: '熟练掌握 Python，熟悉 Golang',
            priority: 'important',
            status: 'strong_match',
            evidence: 'Python 是算法研发和 Agent 工作流主力语言（技能等级 5，3 年以上生产实战），Golang 用于高并发调度和实时系统（技能等级 4），均有多个生产级项目背书，完全覆盖 JD 的语言要求。',
          },
          {
            requirement: '熟悉 Docker / K8s 容器化部署，有 MLOps 经验',
            priority: 'important',
            status: 'strong_match',
            evidence: '综合交易生产系统中基于 MLflow + K8s 构建了模型部署、热更新与版本回滚体系；省网级负荷预测一体机完成国产服务器 Docker 容器化适配并在生产环境稳定运行 12 个月零事故——MLOps 能力有完整的生产记录而非实验室经验。',
          },
          {
            requirement: '良好的系统抽象与工程化能力，能独立完成从方案设计到生产交付全流程',
            priority: 'important',
            status: 'strong_match',
            evidence: '多个项目（Agent 平台、内部工具链、交易生产系统、负荷预测一体机）均体现了从需求分析、系统架构设计到生产交付的完整链路，且多次担任产品设计与技术研发双角色，系统抽象能力有充分的跨项目证明。',
          },
          {
            requirement: '有实际 Agent 生产落地案例，而非仅限于 Demo',
            priority: 'nice_to_have',
            status: 'strong_match',
            evidence: '自动建模 Agent 平台明确处于生产状态（迭代周期缩短 1/5、Token 成本量化记录）；负荷预测一体机生产运行 12 个月零事故；综合交易系统按期交付投入生产——多项真实上线案例完全满足 JD 对”生产落地”的优先偏好，而不是拼凑出来的 Demo。',
          },
        ],
        gaps: [
          {
            missing: 'LangChain / OpenAI Function Calling 等通用框架关键词未显式出现',
            severity: 'low',
            currentState: '档案使用的是 Claude Code / OpenCode，是生产级 Agent 框架经验，但 LangChain、OpenAI Function Calling 等 JD 明确点名的框架在简历中没有出现，可能导致 ATS 关键词扫描时失分，也会让技术面试官产生”技术视野是否足够广？”的疑问。',
            targetState: '招聘方和关键词匹配系统能快速确认候选人对主流 LLM Agent 生态的整体认知范围，而不仅仅是某一框架的深度用户。',
            suggestion: '在技能描述或自我介绍中补充”熟悉 LangChain、OpenAI Function Calling 等主流 Agent 框架设计范式”，表明对生态广度的理解；项目描述中可以加一句与业界框架的横向设计对比，增强技术视野可信度，不需要虚构使用经验。',
          },
          {
            missing: 'Agent 执行引擎底层设计细节（任务拆解、上下文管理、异常恢复）描述不够具体',
            severity: 'low',
            currentState: '档案描述了 Agent 平台覆盖”端到端工作流”和”建模全生命周期”，但对 JD 重点关注的执行引擎底层设计（任务拆解粒度、工具调用失败的重试与降级策略、上下文压缩机制等）着墨不多，技术深度的可读性受限。',
            targetState: 'JD 明确将”覆盖任务拆解、工具调用、上下文管理、异常恢复等核心链路”列为核心职责，技术面试官会重点考察这一层的系统设计思路。',
            suggestion: '在”企业级自动建模 Agent 平台”项目描述中补充 1-2 句执行引擎设计细节，例如任务失败的重试与降级策略、长链路任务的上下文窗口管理方案、工具调用结果的缓存与复用设计，让技术评审者能更快判断出你的系统设计深度。',
          },
        ],
        resumeStrategy: {
          narrative:
            '核心定位线：做过真实 Agent 生产落地、有成本优化记录的 AI 平台工程师——强调的不只是会”用”Agent，而是设计过执行链路、抽象过工具标准、优化过推理成本，并把这些能力推进到了生产环境。建议把”自动建模 Agent 平台（迭代周期 1/5）”和”Tools 工程化体系（Token 消耗 -30%）”两个核心项目作为简历开篇的高亮主线，用量化锚点在 10 秒内让招聘方判断出这是 JD 第 7 条”有实际 Agent 生产落地案例”的候选人，而不是众多停留在概念阶段的 AI 从业者之一。',
          emphasize: [
            '企业级自动建模 Agent 平台（量化锚点：迭代周期压缩至 1/5、单任务 Token 消耗降低 30%）',
            '企业内部 Tools 工程化体系（CLI / API 标准化、Skills 描述规范沉淀）',
            'MLflow + K8s 生产部署体系与稳定运行记录（12 个月零事故）',
            '系统抽象与从技术方案到生产交付的全链路独立完成能力',
          ],
          deemphasize: [
            '储能控制、调频、光伏预测等能源算法细节（分散 Agent 平台主线，与 JD 无关）',
            '清华实验室研究项目（可压缩为单行，把空间让给更相关的工作经历）',
            '量化挖因子和电力交易运营细节（领域术语增加理解成本，且与 Agent 平台方向无关）',
          ],
        },
        createdAt: DEMO_TIMESTAMPS.matchAgentCreatedAt,
      },
      {
        id: 'mr_demo_data_platform_backend',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_data_platform_backend',
        scores: {
          technicalFit: 61,
          experienceFit: 72,
          educationFit: 88,
          culturalFit: 74,
          growthPotential: 71,
          overall: 70,
        },
        summary:
          '与高级后端工程师（数据平台方向）岗位存在明确迁移路径，但不是理想匹配。候选人在实时系统、分布式通信和平台工程化方面具备较强能力，整体工程底蕴可以支撑数据平台方向的部分职责；但岗位的核心硬门槛——Java / Scala、Spring 微服务体系和 Spark / Flink 大数据栈——在当前档案中完全缺席，是结构性的技术栈断层，并非可以快速弥补的认知缺口，且 3 年工作年限也不满足岗位”5 年以上”的要求。',
        requirementMatches: [
          {
            requirement: '5 年以上后端开发经验',
            priority: 'critical',
            status: 'partial_match',
            evidence: '候选人有约 3 年工作经验（2023.03 至今），与岗位”5 年以上”的硬门槛存在约 2 年的年限差距；工程深度有积累，但时间维度的差距无法通过能力转移来弥补。',
          },
          {
            requirement: '精通 Java 或 Scala，熟悉 Spring Boot / Spring Cloud 微服务体系',
            priority: 'critical',
            status: 'no_match',
            evidence: '当前核心技术栈为 Python 与 Golang，档案中没有任何 Java、Scala 或 Spring 生态的项目经历——这是与岗位最核心的技术断层，且无法用 Golang 服务经验等效替代，因为 Spring 体系是数据平台岗位招聘的明确硬门槛。',
          },
          {
            requirement: '有 Spark / Flink / Hive 等大数据技术栈实战经验',
            priority: 'important',
            status: 'no_match',
            evidence: '现有计算引擎经验集中在 JAX / PyTorch（算法侧）和 Golang 实时调度（系统侧），不涉及 Spark、Flink、Hive 等大规模离线批处理或流计算框架，这是另一个核心能力空白。',
          },
          {
            requirement: '设计高可用、高吞吐数据管道，覆盖数据采集、清洗、存储、查询全链路',
            priority: 'critical',
            status: 'partial_match',
            evidence: '滚动撮合实时自动交易系统（5 秒频控 + 毫秒级决策）和分布式模拟器数据交换架构（Redis vs gRPC 吞吐性能对比）体现了高时效数据链路的系统设计能力；但这些是实时计算场景，与大数据平台所要求的大规模批处理 ETL 管道在技术体系和设计范式上有本质差异。',
          },
          {
            requirement: '深入理解分布式系统，熟悉 Kafka、Redis、Elasticsearch 等中间件',
            priority: 'important',
            status: 'partial_match',
            evidence: '分布式模拟器架构评估中涉及 Redis 共享内存模式的深度分析，Protobuf + gRPC 有生产级实战；但 Kafka（消息队列）、Elasticsearch（全文检索）等数据平台高频中间件没有直接项目经验，整体中间件覆盖面不足。',
          },
          {
            requirement: '熟悉 MySQL / ClickHouse / Doris 等 OLAP 引擎',
            priority: 'important',
            status: 'no_match',
            evidence: '档案中没有任何 OLAP 引擎、数据仓库或数据中台相关的系统经历，这一方向的技术积累完全空白。',
          },
          {
            requirement: '有数据平台或数据中台建设经验，能推动跨团队技术方案落地',
            priority: 'nice_to_have',
            status: 'weak_match',
            evidence: '候选人有内部工具链标准化和综合生产系统交付经验，具备一定的平台化建设思路；但方向更接近算法平台与业务系统，不是典型数据中台，且跨团队技术方案推动经验也较为有限。',
          },
        ],
        gaps: [
          {
            missing: '缺少 Java / Scala 与 Spring 微服务体系经验',
            severity: 'high',
            currentState: '当前核心技术栈是 Python（算法 / Agent）和 Golang（实时系统），Java / Scala 及 Spring 生态完全空白，而这是岗位的首要硬门槛，无法通过其他语言经验等效替代。',
            targetState: '至少具备一段用 Java 或 Scala 完成的后端服务项目，覆盖 Spring Boot 开发、微服务拆分、接口设计或数据访问层优化。',
            suggestion: '如果认真考虑转向大数据平台方向，建议先用 3-6 个月时间系统学习 Java / Scala 并完成 1-2 个有数据处理场景的完整项目，再更新简历投递——在没有这段经历的情况下直接投递，通过简历筛选的概率极低。',
          },
          {
            missing: '缺少 Spark / Flink 等大数据计算框架实战',
            severity: 'high',
            currentState: '候选人的计算引擎经验偏向算法侧（JAX / PyTorch 特征计算），没有处理过大规模离线批处理、流计算或 ETL 管道的工程经历，对大数据计算的任务调度、容错机制和性能调优也没有实践基础。',
            targetState: '掌握 Spark 或 Flink 的核心算子、任务调优方法以及与存储层（Hive / HDFS / Kafka）的集成方案，具备处理日均亿级数据量的工程经验。',
            suggestion: '转投更匹配的岗位方向（偏实时系统 / MLOps / 算法平台），这些方向与当前背景的匹配度会高出约 20-30 分；若坚持大数据平台方向，需要先补充 Flink / Spark 实战项目，否则当前简历投递该岗位的转化率极低。',
          },
          {
            missing: '简历叙事主线过于分散，难以快速判断后端工程核心方向',
            severity: 'medium',
            currentState: '档案跨越 Agent 平台、量化交易、负荷预测、储能控制和仿真等多个领域，对于偏纯粹后端平台的招聘方来说，很难在 30 秒内判断出候选人的核心工程方向和最深的技术积累点在哪里。',
            targetState: '叙事主线收束为”分布式系统 / 实时数据处理工程师”，突出系统吞吐、链路可靠性和工程化交付，弱化领域算法术语。',
            suggestion: '如果一定投递此方向，建议重写一版以”平台工程师”为主线的简历，将 Golang 高并发调度、Redis 架构评估、分布式通信设计和生产系统交付放到最显眼的位置；同时主动说明 Python / Golang 技术栈背景，而不是试图规避这个信息。',
          },
        ],
        resumeStrategy: {
          narrative:
            '如果一定要投递，核心叙事应改写为”偏实时系统和平台工程的后端候选人”——主动承认与 Java / 大数据栈的差距，但用真实的 Golang 高并发、分布式通信设计和生产交付能力建立差异化优势。别试图”假装有 Java 背景”，这在技术面试中很容易露出破绽；诚实展示技术迁移路径和工程底蕴反而更有说服力。更务实的建议是优先投递 MLOps、算法平台或 AI 工程化方向，这些岗位与当前背景的匹配度会高出 20-30 分。',
          emphasize: [
            '滚动撮合实时自动交易系统（Golang 高并发 + 毫秒级实时决策）',
            '分布式模拟器数据交换架构（Redis vs gRPC 性能基准分析与自适应切换设计）',
            '省网级负荷预测一体机（生产稳定性、国产化部署、12 个月零事故）',
            '综合交易生产系统（模型部署链路、可视化看板、事后复盘闭环）',
          ],
          deemphasize: [
            'Agent 平台与 LLM 相关内容（与数据平台 JD 的技术叙事方向不符）',
            '能源业务领域术语（电力现货、调频、光伏等，增加理解成本且对后端平台岗无加分）',
            '科研经历（对”5 年以上”经验要求的高级岗位基本无参考价值，建议压缩为单行）',
          ],
        },
        createdAt: DEMO_TIMESTAMPS.matchBackendCreatedAt,
      },
      {
        id: 'mr_demo_ios',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_ios',
        scores: {
          technicalFit: 10,
          experienceFit: 18,
          educationFit: 88,
          culturalFit: 32,
          growthPotential: 22,
          overall: 24,
        },
        summary:
          '与高级 iOS 开发工程师岗位明显不匹配，不建议投递。候选人在 AI 平台、实时系统和算法工程化方向积累深厚，但缺少任何 iOS 原生开发（Swift / OC / SwiftUI）、音视频客户端（AVFoundation / WebRTC）和 Apple 生态（App Store / 组件化架构）的直接经验——技术方向的错配是根本性的，不是短期内可以用通用工程能力弥补的。学历背景符合计算机相关专业要求，但对岗位实际技术门槛的影响微乎其微。',
        requirementMatches: [
          {
            requirement: 'Swift / Objective-C 精通，深入理解 iOS Runtime 机制',
            priority: 'critical',
            status: 'no_match',
            evidence: '当前档案中没有任何 Swift、Objective-C、iOS Runtime 或移动端原生开发的项目记录——这是岗位的首要核心要求，且属于需要长期积累的专项技术体系，无法通过其他编程语言经验等效替代。',
          },
          {
            requirement: 'AVFoundation、WebRTC 等音视频技术栈',
            priority: 'critical',
            status: 'no_match',
            evidence: '现有技术方向集中在 Agent 平台、量化算法和实时交易系统，完全不涉及音视频采集、编解码、传输协议或客户端渲染等移动端音视频工程方向，技术领域几乎没有交集。',
          },
          {
            requirement: '大规模 App 性能优化（启动、渲染、内存、网络）与组件化架构',
            priority: 'important',
            status: 'no_match',
            evidence: '候选人有服务端和算法侧的性能优化经验（JAX 执行引擎计算效率提升 40%、Docker 国产化部署调优），但 iOS App 的启动优化、渲染管线调优、内存管理和组件化拆分是完全独立的技术体系，不能作为等效证明。',
          },
          {
            requirement: 'App Store 审核策略与 Apple 生态规范',
            priority: 'important',
            status: 'no_match',
            evidence: '档案中没有任何与 Apple 开发者账号、App Store 审核流程、Apple 平台规范或 iOS 分发机制相关的经历，这一维度完全缺失。',
          },
          {
            requirement: '实时低延迟系统处理能力（跨领域参考价值有限）',
            priority: 'nice_to_have',
            status: 'partial_match',
            evidence: '候选人有 5 秒频控场景下毫秒级实时决策系统的设计经验（滚动撮合自动交易系统），工程方法论在”高可靠实时系统”这一维度有跨领域参考价值；但招聘方不会因此降低对 iOS 原生技术栈的要求，这只是面试时的加分谈资，不构成核心匹配依据。',
          },
        ],
        gaps: [
          {
            missing: '缺少原生 iOS 开发的全栈经验',
            severity: 'high',
            currentState: '没有任何 Swift / Objective-C、iOS Runtime、SwiftUI 的实践经历，没有发布过 iOS App，没有 App Store 上架和审核经验——是完全的技术体系空白，而不是某个模块的能力不足。',
            targetState: '至少需要 1-2 个独立完成的 iOS 原生项目，覆盖从架构设计、性能优化到 App Store 上架的完整流程，并有 Swift 生产代码经验；若目标是”高级”岗位，还需要音视频或实时通信方向的专项积累。',
            suggestion: '不建议直接投递此岗位，简历通过筛选的概率接近于零。如果计划向移动端方向转型，建议先花 6-12 个月系统学习 iOS 开发，完成覆盖音视频或实时通信场景的完整项目并发布上线，积累可验证的 App Store 记录后，再考虑进入正式求职流程。',
          },
          {
            missing: '缺少社交 / 音视频 / 实时通信类业务场景的产品经验',
            severity: 'high',
            currentState: '全部经历集中在能源算法、量化交易和 AI 工程化，没有 C 端产品、用户交互体验设计或音视频通信场景的任何接触——岗位背景是核心社交产品，需要对用户体验和产品形态有深度理解。',
            targetState: '理解社交产品的用户交互逻辑、直播低延迟场景的技术约束，以及 Apple 生态下的用户习惯与平台规范。',
            suggestion: '优先选择对实时系统有要求但不限定移动端技术栈的岗位（如音视频服务端、WebRTC 信令服务、AI 推理服务或实时数据平台），这些方向与现有背景有更真实的迁移空间，硬投原生 iOS 岗的时间成本收益比极低。',
          },
        ],
        resumeStrategy: {
          narrative:
            '不建议针对该岗位做简历定制，投递意义不大。如果作为演示低匹配度场景使用，建议生成一份”迁移评估稿”：明确列出可迁移的工程能力（实时系统设计、性能约束场景、生产稳定性治理），同时诚实呈现核心能力缺口，让候选人和招聘方都能清楚看到差距所在，而不是产生错误的投递预期。',
          emphasize: [
            '通用工程能力：实时系统设计、性能约束场景下的系统调优、生产稳定性治理',
            '可迁移的方法论：高并发场景资源调度、异常处理与恢复、复杂系统工程交付',
            '诚实的能力边界说明与转型路径建议',
          ],
          deemphasize: [
            '任何暗示或夸大 iOS / 移动端能力的表述（面试中会立即露出破绽）',
            '与 Apple 生态明显无关的硬凑技术关联（如用”边缘计算”映射”移动端性能优化”）',
            '能源、量化等领域算法细节（对移动端 JD 完全没有参考意义，只会分散注意力）',
          ],
        },
        createdAt: DEMO_TIMESTAMPS.matchIosCreatedAt,
      },
    ],
    generatedResumes: [
      {
        id: 'gr_demo_agent_platform',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_agent_platform',
        matchResultId: 'mr_demo_agent_platform',
        strategy: {
          narrative: 'technical',
          language: 'zh',
          length: '1page',
        },
        content: `# keyork

**AI Agent 平台工程师 / 算法工程师**

北京 · chengky18@icloud.com · github.com/keyork · keyork.github.io

---

## 职业定位

3 年 AI 工程化实战，从零搭建并落地企业级自动建模 Agent 平台，有 Skills / Tools 编排、Token 推理成本优化（-30%）和标准化工具链建设的完整交付记录。主力语言 Python / Golang，熟悉 Claude Code / OpenCode、LangChain 等 LLM Agent 框架，具备 Docker / K8s / MLflow 生产部署体系建设经验。

---

## 核心技术能力

**Agent 平台** — Agent 工作流设计 · Skills / Tools 编排与动态调度 · 执行链路优化 · Token 推理成本控制
**语言与框架** — Python · Golang · Claude Code / OpenCode · LangChain · gRPC / Protobuf
**MLOps** — Docker · Kubernetes · MLflow · 模型热更新与版本回滚 · 标准化 CLI / API 工具链

---

## 工作经历

### 地球科技有限公司 · 开发部基础设施组 ｜ 2026.01 至今

**企业级自动建模 Agent 平台**（从零搭建，已生产落地）

- 搭建覆盖 EDA → 特征工程 → 训练 → 超参优化 → 泄露检测 → 镜像导出的全链路 Agent 工作流，设计任务拆解与工具调用执行机制，**将算法从实验到可交付产物的迭代周期压缩 80%**。
- 持续迭代 Skills 编排与动态工具调度策略，**单任务 Token 消耗降低 30%**，在不损失建模效果的前提下控制规模化推理成本。

**企业内部 Tools 工程化体系**（标准化接入设计）

- 将数据获取、模型评测等核心能力抽象为标准化 CLI / API 工具链，统一接口规范、调用协议与文档体系。
- 沉淀 Agent Skills 描述规范，将内部能力从”人工触发”演进为”可编排 Agent 模块”，**降低新工具接入的沟通与集成成本**。

**综合交易生产及测算系统**（全栈交付）

- 兼任产品设计与全栈研发，完成需求分析、架构设计和交付；基于 MLflow + K8s 实现模型部署、热更新与版本回滚，配套多维看板与复盘分析，**按期交付并投入生产运行**。

---

### 地球科技有限公司 · 算法部 ｜ 2023.03 – 2025.12

- **量化挖因子框架**：设计 AST 表达层 + JAX / NumPy / Torch 混合执行引擎，融合遗传算法与 LLM 辅助因子创意生成，**计算效率较上一代提升 40%**，成为量化团队核心基础设施。
- **滚动撮合实时自动交易系统**：Golang 高并发调度 + Python 策略计算混合架构，在 5s 行情推送 + 5s 操作频控约束下，**实现毫秒级策略决策**，支撑全程无人值守实盘交易。
- **省网级负荷预测一体机**：完成核心算法研发与国产化工程交付，综合准确率稳定在 **98%+**，通过网安等保检测部署至省网安全二区，**稳定生产运行 12 个月零事故**。

---

## 教育背景

**清华大学** · 电子信息科学与技术 · 本科 · 2018.08 – 2023.06
- 2020 **MCM/ICM Meritorious Winner**（国际大学生数学建模竞赛一等奖）
- 第35届全国大学生物理竞赛（非物理类 A 组）**一等奖**
- 第一届城市认知智能挑战赛智能交通治理赛道 **全国第三名**
`,
        createdAt: DEMO_TIMESTAMPS.resumeAgentCreatedAt,
      },
      {
        id: 'gr_demo_data_platform_backend',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_data_platform_backend',
        matchResultId: 'mr_demo_data_platform_backend',
        strategy: {
          narrative: 'achievement',
          language: 'zh',
          length: '1page',
        },
        content: `# keyork

**实时系统 / 平台工程方向候选人**

北京 · chengky18@icloud.com · github.com/keyork

> **技术栈说明**：核心技术栈为 Python / Golang，在实时系统、分布式通信和平台工程化方向有 3 年生产实战经验，**不具备 Java / Scala、Spark / Flink 等标准大数据平台栈的直接经历**。本版简历以可迁移能力为主线，如需大数据平台背景请谨慎评估。

---

## 核心技术能力

**系统与并发** — Golang 高并发调度 · Python 算法服务 · gRPC / Protobuf · Redis · 实时数据链路
**MLOps 与部署** — Docker · Kubernetes · MLflow · 模型热更新 · 版本回滚 · 国产化部署适配
**平台工程化** — CLI / API 工具链抽象 · 接口规范设计 · 生产稳定性治理

---

## 工作经历

### 地球科技有限公司 · 开发部基础设施组 ｜ 2026.01 至今

- 将数据获取、模型评测等能力抽象为标准化 CLI / API 工具链，统一接口规范与文档体系，**实现内部能力即插即用接入**，消除跨团队集成的重复协调成本。
- 搭建 MLflow + K8s 模型部署、热更新与版本回滚体系，配套多维看板与损益归因分析，**支撑生产系统稳定运行与策略模型快速迭代**。

### 地球科技有限公司 · 算法部 ｜ 2023.03 – 2025.12

- 主导建设滚动撮合实时自动交易系统，以 Golang 高并发调度 + Python 策略计算混合架构，在 5s 行情推送 + 5s 操作频控双重约束下，**实现毫秒级决策、全程无人值守实盘零事故**。
- 系统性对比 Redis 共享内存与 Protobuf + gRPC 两种通信模式的吞吐、延迟与资源开销，**以量化实验定位架构切换拐点**，实现运行时自适应策略切换模块。
- 交付省网级负荷预测一体机，综合准确率稳定在 **98%+**，**稳定生产运行 12 个月零事故**；设计并落地电力现货模拟测算平台，**将客户试算周期从 15 天压缩至 2 天**。

---

## 代表项目

### 滚动撮合实时自动交易系统

- 设计 Golang 高并发调度 + Python 策略计算混合架构，在 5s 行情 + 5s 频控双重约束下**实现毫秒级策略决策**与高鲁棒状态同步；基于 Casdoor 完成认证与权限管控，支撑全程无人值守实盘交易零安全事故。

### 分布式模拟器数据交换架构设计

- 系统性量化对比 Redis 共享内存与 Protobuf + gRPC 序列化 RPC 在不同数据规模下的吞吐、延迟与 CPU / 内存开销，**以实验数据定位架构切换拐点**，产出直接指导架构选型的性能分析报告。
- 基于基准结果实现运行时自适应架构切换模块，通信层按负载规模动态选择传输方案，**兼顾吞吐效率与资源成本**。

---

## 教育背景

**清华大学** · 电子信息科学与技术 · 本科 · 2018.08 – 2023.06
- 2020 **MCM/ICM Meritorious Winner**（国际大学生数学建模竞赛一等奖）
- 第35届全国大学生物理竞赛（非物理类 A 组）**一等奖**
- 第一届城市认知智能挑战赛智能交通治理赛道 **全国第三名**
`,
        createdAt: DEMO_TIMESTAMPS.resumeBackendCreatedAt,
      },
      {
        id: 'gr_demo_ios',
        profileId: PROFILE_DEFAULT_ID,
        jdId: 'jd_demo_ios',
        matchResultId: 'mr_demo_ios',
        strategy: {
          narrative: 'growth',
          language: 'zh',
          length: '1page',
        },
        content: `# keyork

**复杂系统工程候选人（低匹配度迁移评估稿）**

北京 · chengky18@icloud.com · github.com/keyork

> **说明**：核心经历集中在 AI Agent 平台、实时交易系统与算法工程化，**不具备** iOS 原生开发（Swift / Objective-C / SwiftUI）、音视频客户端（AVFoundation / WebRTC）或 Apple 生态的直接实战经验。本稿用于呈现低匹配度场景下的生成结果，**不建议实际投递**。

---

## 可迁移的工程能力

- **实时低延迟系统**：设计过 5s 行情推送 + 5s 操作频控约束下的毫秒级交易系统，在系统容错、状态同步和稳定性治理上有可迁移的工程方法论。
- **资源约束场景调优**：在国产化服务器（ARM 架构 + 国产 OS）环境完成 Docker 容器化适配与性能调优，方法论层面与移动端性能优化有一定共通之处。
- **生产交付与长期稳定性**：多个系统有明确的生产上线与长期运行记录（负荷预测一体机 12 个月零事故），具备从系统设计到生产长期运维的完整经验链。

---

## 工作经历（节选）

### 地球科技有限公司 · 开发部基础设施组 ｜ 2026.01 至今

- 主导企业级 Agent 平台、内部工具链和综合交易生产系统的架构设计与全栈交付，**将算法迭代周期压缩 80%**；当前担任基础设施方向技术骨干，持续扩展平台能力边界。
- 搭建 MLflow + K8s 模型部署与热更新体系，兼任产品设计与技术研发，**推动多个复杂系统按期交付并稳定运行**。

### 地球科技有限公司 · 算法部 ｜ 2023.03 – 2025.12

- 主导建设滚动撮合实时自动交易系统（Golang + Python 混合架构），在 5s 频控约束下实现**毫秒级策略决策**，持续支撑无人值守实盘交易。
- 完成省网级负荷预测一体机核心算法研发与国产化部署，综合准确率 **98%+**，**生产稳定运行 12 个月零事故**。

---

## 核心能力缺口（高级 iOS 工程师岗位）

| 岗位要求 | 当前状态 | 差距评估 |
|---------|---------|---------|
| Swift / Objective-C / iOS Runtime | 无相关经历 | 核心硬门槛，无法等效替代 |
| AVFoundation / WebRTC 音视频栈 | 无相关经历 | 核心硬门槛，无法等效替代 |
| iOS 组件化架构 / App 性能优化 | 无相关经历 | 服务端调优经验不可等效 |
| App Store 审核 / Apple 生态规范 | 无相关经历 | 需独立积累，无法跳过 |
| 社交 / 直播 / 通信产品经验 | 无相关经历 | 业务背景完全不同 |

**建议**：转向 iOS 方向需先完成 1-2 个原生项目并上架 App Store 后再投递；当前背景更适合投递 AI 工程化、MLOps 或实时系统相关岗位。

---

## 教育背景

**清华大学** · 电子信息科学与技术 · 本科 · 2018.08 – 2023.06
- 2020 **MCM/ICM Meritorious Winner**（国际大学生数学建模竞赛一等奖）
- 第35届全国大学生物理竞赛（非物理类 A 组）**一等奖**
- 第一届城市认知智能挑战赛智能交通治理赛道 **全国第三名**
`,
        createdAt: DEMO_TIMESTAMPS.resumeIosCreatedAt,
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
