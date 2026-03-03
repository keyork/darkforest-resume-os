import { callAgent } from '../client';
import { PROFILE_AGENT_SYSTEM_PROMPT } from '../prompts';
import type { AIClientConfig } from '../config';
import type {
  SkillData,
  ExperienceData,
  ProjectData,
  EducationData,
  CertificationData,
} from '@/lib/types/item';
import type { Contact } from '@/lib/types/profile';

export interface ParsedProfile {
  profile: {
    name: string;
    title: string;
    summary: string;
    contact: Contact;
  };
  skills: Omit<SkillData, 'type'>[];
  experiences: Omit<ExperienceData, 'type'>[];
  projects: Omit<ProjectData, 'type'>[];
  educations: Omit<EducationData, 'type'>[];
  certifications: Omit<CertificationData, 'type'>[];
}

// Kimi k2.5 context: ~128 K input tokens. We cap the resume text at ~12 000
// characters (~3 000 tokens) so the model has plenty of room for its JSON output.
const MAX_RESUME_CHARS = 12_000;

export async function parseProfileFromText(
  rawText: string,
  clientConfig: AIClientConfig,
): Promise<ParsedProfile> {
  const truncated =
    rawText.length > MAX_RESUME_CHARS
      ? rawText.slice(0, MAX_RESUME_CHARS) + '\n\n[...truncated for length]'
      : rawText;

  const result = await callAgent<ParsedProfile>({
    systemPrompt: PROFILE_AGENT_SYSTEM_PROMPT,
    userMessage: `Parse the following resume:\n\n${truncated}`,
    clientConfig,
    maxTokens: 16_384,
  });

  // Ensure all arrays exist
  return {
    profile: result.profile ?? { name: '', title: '', summary: '', contact: {} },
    skills: result.skills ?? [],
    experiences: result.experiences ?? [],
    projects: result.projects ?? [],
    educations: result.educations ?? [],
    certifications: result.certifications ?? [],
  };
}
