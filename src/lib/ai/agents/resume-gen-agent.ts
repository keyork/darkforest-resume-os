import { callAgent, callAgentText } from '../client';
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

function serializeItems(items: Item[]): string {
  const sections: string[] = [];

  const byType = {
    experience: items.filter((i) => i.type === 'experience'),
    project: items.filter((i) => i.type === 'project'),
    skill: items.filter((i) => i.type === 'skill'),
    education: items.filter((i) => i.type === 'education'),
    certification: items.filter((i) => i.type === 'certification'),
  };

  if (byType.experience.length > 0) {
    sections.push('### Work Experience');
    for (const item of byType.experience) {
      if (item.type !== 'experience') continue;
      const end = item.isCurrent ? 'Present' : (item.endDate ?? '');
      sections.push(`**${item.title}** at ${item.company} (${item.startDate} – ${end})`);
      if (item.location) sections.push(`Location: ${item.location}`);
      sections.push(item.description);
      if (item.achievements.length > 0) {
        sections.push('Achievements:');
        for (const ach of item.achievements) {
          const metric = ach.metrics
            ? ` [${ach.metrics.type}: ${ach.metrics.value}${ach.metrics.unit}${ach.metrics.context ? `, ${ach.metrics.context}` : ''}]`
            : '';
          sections.push(`- ${ach.description}${metric}`);
        }
      }
      if (item.industryTags.length > 0) {
        sections.push(`Industry: ${item.industryTags.join(', ')}`);
      }
      sections.push('');
    }
  }

  if (byType.project.length > 0) {
    sections.push('### Projects');
    for (const item of byType.project) {
      if (item.type !== 'project') continue;
      const dateRange =
        item.startDate || item.endDate
          ? ` (${item.startDate ?? ''} – ${item.endDate ?? 'Present'})`
          : '';
      sections.push(`**${item.name}** — ${item.role}${dateRange}`);
      if (item.url) sections.push(`URL: ${item.url}`);
      sections.push(item.description);
      if (item.techStack.length > 0) {
        sections.push(`Tech Stack: ${item.techStack.join(', ')}`);
      }
      if (item.achievements.length > 0) {
        sections.push('Achievements:');
        for (const ach of item.achievements) {
          const metric = ach.metrics
            ? ` [${ach.metrics.type}: ${ach.metrics.value}${ach.metrics.unit}${ach.metrics.context ? `, ${ach.metrics.context}` : ''}]`
            : '';
          sections.push(`- ${ach.description}${metric}`);
        }
      }
      sections.push('');
    }
  }

  if (byType.skill.length > 0) {
    sections.push('### Skills');
    for (const item of byType.skill) {
      if (item.type !== 'skill') continue;
      const details: string[] = [`level=${item.level}/5`, `category=${item.category}`];
      if (item.yearsOfExperience != null) details.push(`${item.yearsOfExperience}yrs`);
      if (item.lastUsed) details.push(`lastUsed=${item.lastUsed}`);
      sections.push(`- ${item.name} (${details.join(', ')})`);
      if (item.keywords.length > 0) {
        sections.push(`  Keywords: ${item.keywords.join(', ')}`);
      }
    }
    sections.push('');
  }

  if (byType.education.length > 0) {
    sections.push('### Education');
    for (const item of byType.education) {
      if (item.type !== 'education') continue;
      const end = item.endDate ?? 'Present';
      sections.push(`**${item.degree}** in ${item.major}, ${item.school} (${item.startDate} – ${end})`);
      if (item.gpa) sections.push(`GPA: ${item.gpa}`);
      if (item.highlights.length > 0) {
        for (const h of item.highlights) sections.push(`- ${h}`);
      }
      sections.push('');
    }
  }

  if (byType.certification.length > 0) {
    sections.push('### Certifications');
    for (const item of byType.certification) {
      if (item.type !== 'certification') continue;
      const expiry = item.expiryDate ? ` (expires ${item.expiryDate})` : '';
      sections.push(`- **${item.name}** — ${item.issuer}, issued ${item.issueDate}${expiry}`);
      if (item.credentialId) sections.push(`  Credential ID: ${item.credentialId}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

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
  });

  let markdown = await callAgentText({
    systemPrompt: RESUME_GEN_SYSTEM_PROMPT,
    userMessage: [
      baseContext,
      '',
      '## Approved Resume Plan',
      '',
      formatResumePlan(plan),
    ].join('\n'),
    clientConfig,
    maxTokens: 8192,
  });

  for (let revision = 0; revision <= MAX_REVIEW_REVISIONS; revision += 1) {
    const review = await callAgent<ResumeGenerationReview>({
      systemPrompt: RESUME_REVIEW_SYSTEM_PROMPT,
      userMessage: [
        baseContext,
        '',
        '## Approved Resume Plan',
        '',
        formatResumePlan(plan),
        '',
        '## Draft Resume Markdown',
        '',
        markdown,
      ].join('\n'),
      clientConfig,
      maxTokens: 4096,
    });

    if (review.passed || revision === MAX_REVIEW_REVISIONS) {
      return markdown;
    }

    markdown = await callAgentText({
      systemPrompt: RESUME_GEN_SYSTEM_PROMPT,
      userMessage: [
        baseContext,
        '',
        '## Approved Resume Plan',
        '',
        formatResumePlan(plan),
        '',
        '## Previous Draft',
        '',
        markdown,
        '',
        '## Review Feedback',
        '',
        formatResumeReview(review),
        '',
        'Please revise the previous draft according to the review feedback while preserving accurate facts and Markdown structure.',
      ].join('\n'),
      clientConfig,
      maxTokens: 8192,
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

  const contactLines = Object.entries(profileContact)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join(' | ');

  const messageParts: string[] = [
    '## Profile',
    `Name: ${profileName}`,
    `Title: ${profileTitle}`,
    contactLines ? `Contact: ${contactLines}` : '',
    '',
    `Summary: ${profileSummary}`,
    '',
    '## Generation Strategy',
    `Narrative: ${strategy.narrative}`,
    `Language: ${strategy.language === 'zh' ? 'Chinese (中文)' : 'English'}`,
    `Length: ${strategy.length}`,
    '',
    '## Resume Items (visible=true only)',
    '',
    serializeItems(visibleItems),
  ];

  if (parsedJD) {
    messageParts.push(
      '## Target Job Description (parsed)',
      '',
      JSON.stringify(parsedJD, null, 2),
      '',
    );
  }

  if (matchResult?.resumeStrategy) {
    const rs = matchResult.resumeStrategy;
    messageParts.push(
      '## Resume Strategy from Match Analysis',
      '',
      `Narrative thread: ${rs.narrative}`,
      '',
      `Items to emphasize: ${rs.emphasize.join(', ')}`,
      '',
      `Items to deemphasize: ${rs.deemphasize.join(', ')}`,
      '',
    );
  }

  return messageParts.filter((line) => line !== undefined).join('\n');
}

function formatResumePlan(plan: ResumeGenerationPlan): string {
  return JSON.stringify(
    {
      targetHeadline: plan.targetHeadline ?? '',
      narrativeFocus: plan.narrativeFocus ?? '',
      sectionOrder: plan.sectionOrder ?? [],
      mustEmphasize: plan.mustEmphasize ?? [],
      shouldDeemphasize: plan.shouldDeemphasize ?? [],
      keywordTargets: plan.keywordTargets ?? [],
      writingGuidelines: plan.writingGuidelines ?? [],
      riskChecks: plan.riskChecks ?? [],
    },
    null,
    2,
  );
}

function formatResumeReview(review: ResumeGenerationReview): string {
  return JSON.stringify(
    {
      passed: Boolean(review.passed),
      strengths: review.strengths ?? [],
      issues: review.issues ?? [],
      revisionInstructions: review.revisionInstructions ?? [],
    },
    null,
    2,
  );
}
