// Placeholder for Phase 3

export interface ParsedJD {
  company?: string;
  position?: string;
  level?: string;
  location?: string;
  salaryRange?: string;
  mustHave: string[];
  niceToHave: string[];
  implicitRequirements: Array<{ requirement: string; reasoning: string }>;
  techKeywords: string[];
  businessKeywords: string[];
  cultureKeywords: string[];
  idealCandidateProfile: string;
  coreCompetencies: string[];
  yearsOfExperience?: string;
}

export interface JobDescription {
  id: string;
  rawText: string;
  parsed: ParsedJD | null;
  createdAt: string;
}
