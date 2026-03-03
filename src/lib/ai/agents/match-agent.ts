import { callAgent } from '../client';
import { MATCH_AGENT_SYSTEM_PROMPT } from '../prompts';
import type { AIClientConfig } from '../config';
import type { ParsedJD } from '@/lib/types/jd';
import type { MatchResult } from '@/lib/types/match';

type MatchAnalysisResult = Omit<MatchResult, 'id' | 'profileId' | 'jdId' | 'createdAt'>;

export async function runMatchAnalysis(
  profileSummary: string,
  parsedJD: ParsedJD,
  clientConfig: AIClientConfig,
): Promise<MatchAnalysisResult> {
  const baseUserMessage = [
    '请基于以下候选人信息和岗位描述生成匹配分析。',
    '注意：最终所有分析性文本必须使用简体中文。',
    '',
    '## 候选人档案',
    '',
    profileSummary,
    '',
    '## 结构化岗位描述',
    '',
    JSON.stringify(parsedJD, null, 2),
  ].join('\n');

  let result = await callAgent<MatchAnalysisResult>({
    systemPrompt: MATCH_AGENT_SYSTEM_PROMPT,
    userMessage: baseUserMessage,
    clientConfig,
    maxTokens: 8192,
  });

  if (!isChineseMatchResult(result)) {
    result = await callAgent<MatchAnalysisResult>({
      systemPrompt: MATCH_AGENT_SYSTEM_PROMPT,
      userMessage: `${baseUserMessage}\n\n上一次输出包含英文分析文本。请重新输出，并确保所有分析性文本全部为简体中文。`,
      clientConfig,
      maxTokens: 8192,
    });
  }

  return {
    scores: {
      technicalFit: result.scores?.technicalFit ?? 0,
      experienceFit: result.scores?.experienceFit ?? 0,
      educationFit: result.scores?.educationFit ?? 0,
      culturalFit: result.scores?.culturalFit ?? 0,
      growthPotential: result.scores?.growthPotential ?? 0,
      overall: result.scores?.overall ?? 0,
    },
    summary: result.summary ?? '',
    requirementMatches: result.requirementMatches ?? [],
    gaps: result.gaps ?? [],
    resumeStrategy: {
      narrative: result.resumeStrategy?.narrative ?? '',
      emphasize: result.resumeStrategy?.emphasize ?? [],
      deemphasize: result.resumeStrategy?.deemphasize ?? [],
    },
  };
}

function isChineseMatchResult(result: Partial<MatchAnalysisResult>): boolean {
  const textFields = [
    result.summary,
    result.resumeStrategy?.narrative,
    ...(result.requirementMatches ?? []).map((item) => item.evidence),
    ...(result.gaps ?? []).flatMap((gap) => [
      gap.currentState,
      gap.targetState,
      gap.suggestion,
    ]),
  ].filter((value): value is string => Boolean(value && value.trim()));

  if (textFields.length === 0) return false;

  return textFields.every(hasChineseCharacters);
}

function hasChineseCharacters(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}
