export type ItemType = 'skill' | 'experience' | 'project' | 'education' | 'certification';
export type ItemSource = 'manual' | 'ai_parsed' | 'ai_confirmed';

export type SkillCategory =
  | 'programming_language'
  | 'framework'
  | 'tool'
  | 'methodology'
  | 'soft_skill'
  | 'domain_knowledge'
  | 'management'
  | 'design'
  | 'data'
  | 'devops'
  | 'other';

export type SkillLevel = 1 | 2 | 3 | 4 | 5; // 了解/熟悉/熟练/精通/专家

export interface Achievement {
  id: string;
  description: string;
  metrics?: {
    type: string;
    value: number;
    unit: string;
    context?: string;
  };
}

// --- Per-type data payloads ---

export interface SkillData {
  type: 'skill';
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  yearsOfExperience?: number;
  lastUsed?: string; // YYYY-MM
  keywords: string[];
  notes?: string;
}

export interface ExperienceData {
  type: 'experience';
  company: string;
  title: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM, undefined = current
  isCurrent: boolean;
  location?: string;
  description: string;
  achievements: Achievement[];
  relatedSkills: string[]; // item ids
  industryTags: string[];
}

export interface ProjectData {
  type: 'project';
  name: string;
  role: string;
  description: string;
  techStack: string[];
  achievements: Achievement[];
  relatedSkills: string[]; // item ids
  url?: string;
  startDate?: string; // YYYY-MM
  endDate?: string; // YYYY-MM
}

export interface EducationData {
  type: 'education';
  school: string;
  degree: string;
  major: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM
  gpa?: string;
  highlights: string[];
}

export interface CertificationData {
  type: 'certification';
  name: string;
  issuer: string;
  issueDate: string; // YYYY-MM
  expiryDate?: string; // YYYY-MM
  credentialId?: string;
  relatedSkills: string[]; // item ids
}

export type ItemData =
  | SkillData
  | ExperienceData
  | ProjectData
  | EducationData
  | CertificationData;

// --- Base item fields ---

export interface ItemBase {
  id: string;
  profileId: string;
  visible: boolean;
  sortOrder: number;
  source: ItemSource;
  createdAt: string;
  updatedAt: string;
}

// --- Discriminated union ---

export type Item = ItemBase & ItemData;

// Narrowing helpers
export type SkillItem = ItemBase & SkillData;
export type ExperienceItem = ItemBase & ExperienceData;
export type ProjectItem = ItemBase & ProjectData;
export type EducationItem = ItemBase & EducationData;
export type CertificationItem = ItemBase & CertificationData;

// ID prefixes
export const ITEM_ID_PREFIXES: Record<ItemType, string> = {
  skill: 'sk_',
  experience: 'exp_',
  project: 'prj_',
  education: 'edu_',
  certification: 'cert_',
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  programming_language: '编程语言',
  framework: '框架',
  tool: '工具',
  methodology: '方法论',
  soft_skill: '软技能',
  domain_knowledge: '领域知识',
  management: '管理',
  design: '设计',
  data: '数据',
  devops: 'DevOps',
  other: '其他',
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  1: '了解',
  2: '熟悉',
  3: '熟练',
  4: '精通',
  5: '专家',
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  skill: '技能',
  experience: '工作经历',
  project: '项目',
  education: '教育',
  certification: '证书',
};
