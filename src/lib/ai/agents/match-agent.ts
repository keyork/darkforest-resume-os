import { callAgent } from '../client';
import { MATCH_AGENT_SYSTEM_PROMPT } from '../prompts';
import type { ParsedJD } from '@/lib/types/jd';
import type { MatchResult } from '@/lib/types/match';

type MatchAnalysisResult = Omit<MatchResult, 'id' | 'profileId' | 'jdId' | 'createdAt'>;

export async function runMatchAnalysis(
  profileSummary: string,
  parsedJD: ParsedJD,
): Promise<MatchAnalysisResult> {
  const userMessage = [
    '## Candidate Profile',
    '',
    profileSummary,
    '',
    '## Parsed Job Description',
    '',
    JSON.stringify(parsedJD, null, 2),
  ].join('\n');

  const result = await callAgent<MatchAnalysisResult>({
    systemPrompt: MATCH_AGENT_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 8192,
  });

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
