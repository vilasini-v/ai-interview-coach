// Shared shapes for structured agent output. Gemini is prompted to return
// JSON matching these exactly, then we parse + validate before saving.

export interface AgentStep {
  step: string; // e.g. "gap_identification"
  summary: string; // one-line human-readable description of what the agent did
  timestamp: string;
}

export interface GapAnalysis {
  overallFit: "strong" | "moderate" | "weak";
  summary: string;
  missingSkills: string[];
  missingExperience: string[];
  strengths: string[];
}

export interface KeywordMatch {
  matchScorePct: number; // 0-100
  matchedKeywords: string[];
  missingKeywords: string[]; // present in JD, absent/weak in resume
  notes: string;
}

export interface BulletRewrite {
  original: string;
  rewritten: string;
  rationale: string;
  targetKeywords: string[];
}

export interface ResumeAnalysisResult {
  gapAnalysis: GapAnalysis;
  keywordMatch: KeywordMatch;
  rewrites: BulletRewrite[];
  agentTrace: AgentStep[];
}

export type QuestionType = "opening" | "follow_up" | "behavioral" | "technical";

export interface GeneratedQuestion {
  question: string;
  questionType: QuestionType;
  rationale: string;
}

export interface AnswerFeedback {
  score: number; // 1-5
  strengths: string[];
  improvements: string[];
  idealAnswerPointers: string[];
  shouldFollowUp: boolean;
  followUpQuestion?: string;
}
