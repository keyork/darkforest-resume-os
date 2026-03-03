// Placeholder for Phase 3

export type MatchStatus = 'strong_match' | 'partial_match' | 'weak_match' | 'no_match';

export interface RequirementMatch {
  requirement: string;
  priority: 'critical' | 'important' | 'nice_to_have';
  status: MatchStatus;
  evidence: string;
}

export interface GapItem {
  missing: string;
  severity: 'high' | 'medium' | 'low';
  currentState: string;
  targetState: string;
  suggestion: string;
}

export interface MatchScores {
  technicalFit: number;
  experienceFit: number;
  educationFit: number;
  culturalFit: number;
  growthPotential: number;
  overall: number;
}

export interface MatchResult {
  id: string;
  profileId: string;
  jdId: string;
  scores: MatchScores;
  summary: string;
  requirementMatches: RequirementMatch[];
  gaps: GapItem[];
  resumeStrategy: {
    narrative: string;
    emphasize: string[];
    deemphasize: string[];
  };
  createdAt: string;
}
