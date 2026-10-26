/**
 * Skill Matching TypeScript contracts (Role 5, Part 5).
 * Strictly mirrors docs/radix-talent-match/schemas/skill-match-result.schema.json
 * and the shared error envelope.
 */

export type RequirementType = "required" | "preferred" | "unknown";

export type ConfidenceLevel = "high" | "medium" | "low";

export type MatchMethod = "exact" | "alias";

export type CategoryCode =
  | "COD"
  | "DSA"
  | "OOD"
  | "APTI"
  | "COMM"
  | "AI"
  | "CLOUD"
  | "SQL"
  | "SWE"
  | "SYSD"
  | "NETW"
  | "OS"
  | "OTHER";

export interface Requirement {
  skill_name: string;
  category_code: CategoryCode;
  evidence: string;
  confidence: ConfidenceLevel;
  requirement_type: RequirementType;
  weight: number;
}

export interface MatchedSkill {
  requirement: Requirement;
  candidate_skill_name: string;
  candidate_evidence: string;
  match_method: MatchMethod;
  /** Optional category code from candidate profile if present for category mismatch warning */
  candidate_category_code?: CategoryCode;
}

export interface PossibleMatch {
  requirement: Requirement;
  candidate_skill_name: string;
  candidate_evidence: string;
  similarity: number;
  review_status: string;
  candidate_category_code?: CategoryCode;
}

export interface MatchSummary {
  unique_requirements: number;
  confirmed_matches: number;
  possible_count: number;
  missing_count: number;
  interpretation_notice: string;
}

export interface SkillMatchResult {
  schema_version: "1.0.0";
  assessment_id: string;
  profile_id: string;
  job_description_id: string;
  company: string | null;
  role: string | null;
  match_score: number;
  scoring_version: "sm-v1";
  created_at: string;
  matched_skills: MatchedSkill[];
  possible_matches: PossibleMatch[];
  missing_skills: Requirement[];
  summary: MatchSummary;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  request_id: string;
  details?: Array<Record<string, unknown>>;
}

export interface ApiErrorEnvelope {
  error: ApiErrorDetail;
}

export type SkillMatchingState = "idle" | "processing" | "ready" | "error" | "empty";

export interface SkillMatchingPageProps {
  /** UUID of the saved Job Description extraction to match against. */
  jobDescriptionId: string;
  /** Injectable execution function; defaults to shared API client when available. */
  runSkillMatch?: (jobDescriptionId: string) => Promise<SkillMatchResult>;
  /** Optional initial result for preview/SSR or fixture testing. */
  initialResult?: SkillMatchResult | null;
  /** Optional callback after a successful match run */
  onMatchComplete?: (result: SkillMatchResult) => void;
}
