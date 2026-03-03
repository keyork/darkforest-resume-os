// Placeholder for Phase 4

export type NarrativeStrategy =
  | 'achievement'
  | 'skill'
  | 'growth'
  | 'leadership'
  | 'technical';

export interface GenerationStrategy {
  narrative: NarrativeStrategy;
  language: 'zh' | 'en';
  length: '1page' | '2page';
  jdId?: string;
  matchResultId?: string;
}

export interface GeneratedResume {
  id: string;
  profileId: string;
  jdId?: string;
  matchResultId?: string;
  strategy: GenerationStrategy;
  content: string; // Markdown
  createdAt: string;
}
