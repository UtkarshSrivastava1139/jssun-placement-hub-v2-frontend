export const RADIX_CATEGORIES = [
  "COD",
  "DSA",
  "OOD",
  "APTI",
  "COMM",
  "AI",
  "CLOUD",
  "SQL",
  "SWE",
  "SYSD",
  "NETW",
  "OS",
] as const;

export type CategoryCode = (typeof RADIX_CATEGORIES)[number];
export const TOPIC_RESPONSES = ["unfamiliar", "recognize", "guided", "independent"] as const;
export type TopicResponseValue = (typeof TOPIC_RESPONSES)[number];
export type TopicResponse = { topic_id: number; response: TopicResponseValue };
export type TopicRecord = {
  topic_id: number;
  category_code: CategoryCode;
  level_number: number;
  topic: string;
};
export type TopicAssessment = {
  responses: TopicResponse[];
  suggested_level: number | null;
  status: "suggested" | "insufficient_evidence" | "data_unavailable";
  scoring_version: "topic-self-assessment-v1";
  confirmed: boolean;
};
export type Assessment = {
  category_code: CategoryCode;
  self_assessed_level: number | null;
  assessment_basis: "candidate_self_assessment" | "unassessed";
  evidence_note: string | null;
  topic_assessment?: TopicAssessment;
};

export type Education = {
  degree: string | null;
  institution: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
};

export type CandidateSkill = {
  skill_name: string;
  category_code: CategoryCode | "OTHER";
  evidence: string;
  confidence: "high" | "medium" | "low";
  provenance:
    | "resume_extraction"
    | "candidate_entered"
    | "project"
    | "internship"
    | "certification"
    | "other";
  canonical_skill_key: string | null;
};

export type Project = {
  title: string;
  description: string | null;
  technologies: string[];
  outcome: string | null;
};

export type ExperienceItem = {
  title: string | null;
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
};

export type Certification = {
  name: string;
  issuer: string | null;
  issued_date: string | null;
};

export type CandidateProfile = {
  schema_version: "1.0.0" | "1.1.0";
  name: string;
  email: string | null;
  education: Education[];
  skills: CandidateSkill[];
  projects: Project[];
  hackathons: ExperienceItem[];
  internships: ExperienceItem[];
  certifications: Certification[];
  preferred_roles: string[];
  category_assessments: Assessment[];
  resume_metadata: {
    original_filename: string | null;
    parsed_at: string | null;
    raw_file_retained: false;
  };
};

export type SavedProfileRecord = {
  profile_id: string;
  schema_version: "1.0.0" | "1.1.0";
  profile: CandidateProfile;
  created_at: string;
  updated_at: string;
};

export function blankProfile(): CandidateProfile {
  return {
    schema_version: "1.1.0",
    name: "",
    email: null,
    education: [],
    skills: [],
    projects: [],
    hackathons: [],
    internships: [],
    certifications: [],
    preferred_roles: [],
    category_assessments: RADIX_CATEGORIES.map((category_code) => ({
      category_code,
      self_assessed_level: null,
      assessment_basis: "unassessed",
      evidence_note: null,
    })),
    resume_metadata: {
      original_filename: null,
      parsed_at: null,
      raw_file_retained: false,
    },
  };
}
