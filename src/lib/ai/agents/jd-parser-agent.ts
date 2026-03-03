import { callAgent } from '../client';
import { JD_PARSER_SYSTEM_PROMPT } from '../prompts';
import type { AIClientConfig } from '../config';
import type { ParsedJD } from '@/lib/types/jd';

const MAX_JD_CHARS = 8_000;

export async function parseJDFromText(
  rawText: string,
  clientConfig: AIClientConfig,
): Promise<ParsedJD> {
  const truncated =
    rawText.length > MAX_JD_CHARS
      ? rawText.slice(0, MAX_JD_CHARS) + '\n[...truncated]'
      : rawText;

  const result = await callAgent<ParsedJD>({
    systemPrompt: JD_PARSER_SYSTEM_PROMPT,
    userMessage: `Parse the following job description:\n\n${truncated}`,
    clientConfig,
    maxTokens: 4096,
  });

  return {
    company: result.company ?? undefined,
    position: result.position ?? '',
    level: result.level ?? undefined,
    location: result.location ?? undefined,
    salaryRange: result.salaryRange ?? undefined,
    mustHave: result.mustHave ?? [],
    niceToHave: result.niceToHave ?? [],
    implicitRequirements: result.implicitRequirements ?? [],
    techKeywords: result.techKeywords ?? [],
    businessKeywords: result.businessKeywords ?? [],
    cultureKeywords: result.cultureKeywords ?? [],
    idealCandidateProfile: result.idealCandidateProfile ?? '',
    coreCompetencies: result.coreCompetencies ?? [],
    yearsOfExperience: result.yearsOfExperience ?? undefined,
  };
}
