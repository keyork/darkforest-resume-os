import { z } from 'zod';

function normalizeString(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value).trim();
}

function normalizeNullableString(value: unknown): string | null | undefined {
  if (value === undefined || value === '') return undefined;
  if (value === null) return null;

  const normalized = String(value).trim();
  return normalized === '' ? undefined : normalized;
}

function normalizeLooseYearMonth(value: unknown): string | null | undefined | unknown {
  if (value === undefined || value === '') return undefined;
  if (value === null) return null;

  const raw = String(value).trim();
  if (!raw) return undefined;

  const normalized = raw.replace(/[/.]/g, '-');

  let match = normalized.match(/^(\d{4})$/);
  if (match) {
    return `${match[1]}-01`;
  }

  match = normalized.match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}`;
  }

  match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}`;
  }

  return null;
}

const yyyyMm = z.string().regex(/^\d{4}-\d{2}$/);
const requiredString = z.preprocess((value) => normalizeString(value), z.string());
const nullableString = z.preprocess(
  (value) => normalizeNullableString(value),
  z.union([z.string(), z.null()]).optional()
);
const stringArray = z.preprocess((value) => (Array.isArray(value) ? value : []), z.array(z.string())).default([]);
const objectOrEmpty = <T extends z.ZodRawShape>(shape: T) =>
  z.preprocess(
    (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {}),
    z.object(shape)
  );
const optionalYearMonth = z.preprocess(
  (value) => normalizeLooseYearMonth(value),
  z.union([yyyyMm, z.null()]).optional()
);

const metricsSchema = z.object({
  type: requiredString,
  value: z.coerce.number(),
  unit: requiredString,
  context: nullableString,
});

const achievementSchema = z.object({
  id: requiredString,
  description: requiredString,
  metrics: z.union([metricsSchema, z.null()]).optional(),
});

export const ParsedProfileSchema = z.object({
  profile: z.preprocess(
    (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {}),
    z.object({
      name: z.preprocess((value) => normalizeString(value), z.string().default('')),
      title: z.preprocess((value) => normalizeString(value), z.string().default('')),
      summary: z.preprocess((value) => normalizeString(value), z.string().default('')),
      contact: objectOrEmpty({
      email: nullableString,
      phone: nullableString,
      location: nullableString,
      website: nullableString,
      linkedin: nullableString,
      github: nullableString,
      }).default({}),
    }).default({ name: '', title: '', summary: '', contact: {} })
  ),
  skills: z.array(z.object({
    name: requiredString,
    category: z.enum([
      'programming_language',
      'framework',
      'tool',
      'methodology',
      'soft_skill',
      'domain_knowledge',
      'management',
      'design',
      'data',
      'devops',
      'other',
    ]),
    level: z.coerce.number().int().min(1).max(5),
    yearsOfExperience: z.union([z.coerce.number(), z.null()]).optional(),
    lastUsed: optionalYearMonth,
    keywords: stringArray,
    notes: nullableString,
  })).default([]),
  experiences: z.array(z.object({
    company: requiredString,
    title: requiredString,
    startDate: yyyyMm,
    endDate: optionalYearMonth,
    isCurrent: z.boolean(),
    location: nullableString,
    description: requiredString,
    achievements: z.array(achievementSchema).default([]),
    relatedSkills: stringArray,
    industryTags: stringArray,
  })).default([]),
  projects: z.array(z.object({
    name: requiredString,
    role: requiredString,
    description: requiredString,
    techStack: stringArray,
    achievements: z.array(achievementSchema).default([]),
    relatedSkills: stringArray,
    url: nullableString,
    startDate: optionalYearMonth,
    endDate: optionalYearMonth,
  })).default([]),
  educations: z.array(z.object({
    school: requiredString,
    degree: requiredString,
    major: requiredString,
    startDate: yyyyMm,
    endDate: optionalYearMonth,
    gpa: nullableString,
    highlights: stringArray,
  })).default([]),
  certifications: z.array(z.object({
    name: requiredString,
    issuer: requiredString,
    issueDate: yyyyMm,
    expiryDate: optionalYearMonth,
    credentialId: nullableString,
    relatedSkills: stringArray,
  })).default([]),
});

export const ParsedJDSchema = z.object({
  company: nullableString,
  position: z.preprocess((value) => normalizeString(value), z.string().default('')),
  level: nullableString,
  location: nullableString,
  salaryRange: nullableString,
  mustHave: stringArray,
  niceToHave: stringArray,
  implicitRequirements: z.array(z.object({
    requirement: requiredString,
    reasoning: requiredString,
  })).default([]),
  techKeywords: stringArray,
  businessKeywords: stringArray,
  cultureKeywords: stringArray,
  idealCandidateProfile: z.preprocess((value) => normalizeString(value), z.string().default('')),
  coreCompetencies: stringArray,
  yearsOfExperience: nullableString,
});

export const MatchAnalysisSchema = z.object({
  scores: z.object({
    technicalFit: z.coerce.number().min(0).max(100).default(0),
    experienceFit: z.coerce.number().min(0).max(100).default(0),
    educationFit: z.coerce.number().min(0).max(100).default(0),
    culturalFit: z.coerce.number().min(0).max(100).default(0),
    growthPotential: z.coerce.number().min(0).max(100).default(0),
    overall: z.coerce.number().min(0).max(100).default(0),
  }).default({
    technicalFit: 0,
    experienceFit: 0,
    educationFit: 0,
    culturalFit: 0,
    growthPotential: 0,
    overall: 0,
  }),
  summary: z.preprocess((value) => normalizeString(value), z.string().default('')),
  requirementMatches: z.array(z.object({
    requirement: requiredString,
    priority: z.enum(['critical', 'important', 'nice_to_have']),
    status: z.enum(['strong_match', 'partial_match', 'weak_match', 'no_match']),
    evidence: requiredString,
  })).default([]),
  gaps: z.array(z.object({
    missing: requiredString,
    severity: z.enum(['high', 'medium', 'low']),
    currentState: requiredString,
    targetState: requiredString,
    suggestion: requiredString,
  })).default([]),
  resumeStrategy: z.object({
    narrative: z.preprocess((value) => normalizeString(value), z.string().default('')),
    emphasize: stringArray,
    deemphasize: stringArray,
  }).default({
    narrative: '',
    emphasize: [],
    deemphasize: [],
  }),
});

export const ResumeGenerationPlanSchema = z.object({
  targetHeadline: z.preprocess((value) => normalizeString(value), z.string().default('')),
  narrativeFocus: z.preprocess((value) => normalizeString(value), z.string().default('')),
  sectionOrder: stringArray,
  mustEmphasize: stringArray,
  shouldDeemphasize: stringArray,
  keywordTargets: stringArray,
  writingGuidelines: stringArray,
  riskChecks: stringArray,
});

export const ResumeGenerationReviewSchema = z.object({
  passed: z.boolean().default(false),
  strengths: stringArray,
  issues: stringArray,
  revisionInstructions: stringArray,
});
