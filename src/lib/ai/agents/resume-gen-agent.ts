import { callAgent, callAgentText } from '../client';
import {
  renderAuthoritativeJsonSection,
  renderReferenceJsonSection,
  renderReferenceTextSection,
} from '../context';
import {
  RESUME_GEN_SYSTEM_PROMPT,
  RESUME_PLAN_SYSTEM_PROMPT,
  RESUME_REVIEW_SYSTEM_PROMPT,
} from '../prompts';
import type { AIClientConfig } from '../config';
import type { GenerationStrategy } from '@/lib/types/resume';
import type { Item } from '@/lib/types/item';
import type { ParsedJD } from '@/lib/types/jd';
import type { MatchResult } from '@/lib/types/match';
import {
  ResumeGenerationPlanSchema,
  ResumeGenerationReviewSchema,
} from '../schemas';

export interface ResumeGenInput {
  profileName: string;
  profileTitle: string;
  profileSummary: string;
  profileContact: Record<string, string | undefined>;
  visibleItems: Item[];
  strategy: GenerationStrategy;
  parsedJD?: ParsedJD | null;
  matchResult?: Pick<MatchResult, 'resumeStrategy'> | null;
}

interface ResumeGenerationPlan {
  targetHeadline: string;
  narrativeFocus: string;
  sectionOrder: string[];
  mustEmphasize: string[];
  shouldDeemphasize: string[];
  keywordTargets: string[];
  writingGuidelines: string[];
  riskChecks: string[];
}

interface ResumeGenerationReview {
  passed: boolean;
  strengths: string[];
  issues: string[];
  revisionInstructions: string[];
}

const MAX_REVIEW_REVISIONS = 1;

export async function generateResumeMarkdown(
  input: ResumeGenInput,
  clientConfig: AIClientConfig,
): Promise<string> {
  const {
    profileName,
    profileTitle,
    profileSummary,
    profileContact,
    visibleItems,
    strategy,
    parsedJD,
    matchResult,
  } = input;

  const baseContext = buildResumeGenerationContext({
    profileName,
    profileTitle,
    profileSummary,
    profileContact,
    visibleItems,
    strategy,
    parsedJD,
    matchResult,
  });

  const plan = await callAgent<ResumeGenerationPlan>({
    systemPrompt: RESUME_PLAN_SYSTEM_PROMPT,
    userMessage: baseContext,
    clientConfig,
    maxTokens: 4096,
    temperature: 0.2,
    schema: ResumeGenerationPlanSchema,
  });

  let markdown = await callAgentText({
    systemPrompt: RESUME_GEN_SYSTEM_PROMPT,
    userMessage: [
      baseContext,
      '',
      renderReferenceJsonSection('Derived Resume Plan', formatResumePlan(plan)),
    ].join('\n'),
    clientConfig,
    maxTokens: 8192,
    temperature: 0.65,
  });

  for (let revision = 0; revision <= MAX_REVIEW_REVISIONS; revision += 1) {
    const review = await callAgent<ResumeGenerationReview>({
      systemPrompt: RESUME_REVIEW_SYSTEM_PROMPT,
      userMessage: [
        baseContext,
        '',
        renderReferenceJsonSection('Derived Resume Plan', formatResumePlan(plan)),
        '',
        renderReferenceTextSection('Draft Resume Markdown', 'DRAFT_RESUME_MARKDOWN', markdown),
      ].join('\n'),
      clientConfig,
      maxTokens: 4096,
      temperature: 0,
      schema: ResumeGenerationReviewSchema,
    });

    if (review.passed || revision === MAX_REVIEW_REVISIONS) {
      return markdown;
    }

    markdown = await callAgentText({
      systemPrompt: RESUME_GEN_SYSTEM_PROMPT,
      userMessage: [
        baseContext,
        '',
        renderReferenceJsonSection('Derived Resume Plan', formatResumePlan(plan)),
        '',
        renderReferenceTextSection('Previous Draft', 'PREVIOUS_DRAFT', markdown),
        '',
        renderReferenceJsonSection('Review Feedback', formatResumeReview(review)),
        '',
        'Revise the previous draft according to the review feedback.',
        'Keep only claims supported by authoritative facts.',
        'If a claim in the previous draft is unsupported, remove or rewrite it.',
      ].join('\n'),
      clientConfig,
      maxTokens: 8192,
      temperature: 0.45,
    });
  }

  return markdown;
}

function buildResumeGenerationContext(input: ResumeGenInput): string {
  const {
    profileName,
    profileTitle,
    profileSummary,
    profileContact,
    visibleItems,
    strategy,
    parsedJD,
    matchResult,
  } = input;

  const authoritativeFacts = {
    profile: {
      name: profileName,
      title: profileTitle,
      summary: profileSummary,
      contact: Object.fromEntries(
        Object.entries(profileContact).filter(([, value]) => Boolean(value))
      ),
    },
    generationStrategy: {
      narrative: strategy.narrative,
      language: strategy.language,
      length: strategy.length,
    },
    visibleItems: groupVisibleItemsForModel(visibleItems),
    targetJobDescription: parsedJD ?? null,
    matchAnalysisStrategy: matchResult?.resumeStrategy ?? null,
  };

  return [
    'Use only the AUTHORITATIVE_JSON block below as the factual source for resume content.',
    'Any later plan, review, or prior draft blocks are non-authoritative and may guide revision only.',
    '',
    renderAuthoritativeJsonSection('Authoritative Resume Facts', authoritativeFacts),
  ].join('\n');
}

function formatResumePlan(plan: ResumeGenerationPlan) {
  return {
    targetHeadline: plan.targetHeadline ?? '',
    narrativeFocus: plan.narrativeFocus ?? '',
    sectionOrder: plan.sectionOrder ?? [],
    mustEmphasize: plan.mustEmphasize ?? [],
    shouldDeemphasize: plan.shouldDeemphasize ?? [],
    keywordTargets: plan.keywordTargets ?? [],
    writingGuidelines: plan.writingGuidelines ?? [],
    riskChecks: plan.riskChecks ?? [],
  };
}

function formatResumeReview(review: ResumeGenerationReview) {
  return {
    passed: Boolean(review.passed),
    strengths: review.strengths ?? [],
    issues: review.issues ?? [],
    revisionInstructions: review.revisionInstructions ?? [],
  };
}

function groupVisibleItemsForModel(items: Item[]) {
  return {
    experiences: items
      .filter((item) => item.type === 'experience')
      .map((item) => ({
        company: item.company,
        title: item.title,
        startDate: item.startDate,
        endDate: item.endDate ?? null,
        isCurrent: item.isCurrent,
        location: item.location ?? null,
        description: item.description,
        achievements: item.achievements,
        industryTags: item.industryTags,
      })),
    projects: items
      .filter((item) => item.type === 'project')
      .map((item) => ({
        name: item.name,
        role: item.role,
        description: item.description,
        techStack: item.techStack,
        achievements: item.achievements,
        url: item.url ?? null,
        startDate: item.startDate ?? null,
        endDate: item.endDate ?? null,
      })),
    skills: items
      .filter((item) => item.type === 'skill')
      .map((item) => ({
        name: item.name,
        category: item.category,
        level: item.level,
        yearsOfExperience: item.yearsOfExperience ?? null,
        lastUsed: item.lastUsed ?? null,
        keywords: item.keywords,
        notes: item.notes ?? null,
      })),
    educations: items
      .filter((item) => item.type === 'education')
      .map((item) => ({
        school: item.school,
        degree: item.degree,
        major: item.major,
        startDate: item.startDate,
        endDate: item.endDate ?? null,
        gpa: item.gpa ?? null,
        highlights: item.highlights,
      })),
    certifications: items
      .filter((item) => item.type === 'certification')
      .map((item) => ({
        name: item.name,
        issuer: item.issuer,
        issueDate: item.issueDate,
        expiryDate: item.expiryDate ?? null,
        credentialId: item.credentialId ?? null,
      })),
  };
}
