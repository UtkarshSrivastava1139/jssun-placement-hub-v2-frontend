/**
 * TypeScript types for ResumeExtractionResult (contract v1.0.0).
 *
 * Mirrors docs/radix-talent-match/schemas/resume-extraction-result.schema.json
 * exactly. These types are the frontend contract boundary.
 */

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

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ResumeSkill {
  skill_name: string;
  category_code: CategoryCode;
  evidence: string;
  confidence: ConfidenceLevel;
  canonical_skill_key: string | null;
}

export interface Education {
  degree: string | null;
  institution: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
  evidence: string | null;
}

export interface ExperienceItem {
  title: string | null;
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  evidence: string | null;
}

export interface Project {
  title: string;
  description: string | null;
  technologies: string[];
  outcome: string | null;
  evidence: string | null;
}

export interface Certification {
  name: string;
  issuer: string | null;
  issued_date: string | null;
  evidence: string | null;
}

export interface CandidateDetails {
  name: string | null;
  email: string | null;
  education: Education[];
  projects: Project[];
  experience: ExperienceItem[];
  hackathons: ExperienceItem[];
  internships: ExperienceItem[];
  certifications: Certification[];
  preferred_roles: string[];
}

export interface ResumeExtractionResult {
  schema_version: "1.0.0";
  source_type: "resume";
  source_file: string;
  company: string | null;
  role: string | null;
  location: string | null;
  skills: ResumeSkill[];
  candidate_details: CandidateDetails;
  warnings: string[];
}

/** Common error envelope shape from the API. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    request_id: string;
    details: Record<string, unknown>[];
  };
}

/** UI state machine for the resume parsing flow. */
export type ResumeParsingState =
  | "idle"
  | "uploading"
  | "processing"
  | "needs_review"
  | "ready"
  | "error";

const resumeSkillSchema = z.object({
  skill_name: z.string().min(1).max(120),
  category_code: z.enum([
    "COD", "DSA", "OOD", "APTI", "COMM", "AI", "CLOUD",
    "SQL", "SWE", "SYSD", "NETW", "OS", "OTHER",
  ]),
  evidence: z.string().min(1).max(500),
  confidence: z.enum(["high", "medium", "low"]),
  canonical_skill_key: z.string().max(120).nullable(),
}).strict();

const educationSchema = z.object({
  degree: z.string().max(160).nullable(),
  institution: z.string().max(200).nullable(),
  field_of_study: z.string().max(160).nullable(),
  graduation_year: z.number().int().min(1950).max(2100).nullable(),
  evidence: z.string().max(500).nullable(),
}).strict();

const experienceSchema = z.object({
  title: z.string().max(160).nullable(),
  organization: z.string().max(200).nullable(),
  start_date: z.string().max(40).nullable(),
  end_date: z.string().max(40).nullable(),
  description: z.string().max(1500).nullable(),
  evidence: z.string().max(500).nullable(),
}).strict();

const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1500).nullable(),
  technologies: z.array(z.string()),
  outcome: z.string().max(500).nullable(),
  evidence: z.string().max(500).nullable(),
}).strict();

const certificationSchema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().max(200).nullable(),
  issued_date: z.string().max(40).nullable(),
  evidence: z.string().max(500).nullable(),
}).strict();

const resumeExtractionResultSchema = z.object({
  schema_version: z.literal("1.0.0"),
  source_type: z.literal("resume"),
  source_file: z.string().min(1).max(255),
  company: z.string().max(200).nullable(),
  role: z.string().max(200).nullable(),
  location: z.string().max(200).nullable(),
  skills: z.array(resumeSkillSchema),
  candidate_details: z.object({
    name: z.string().max(160).nullable(),
    email: z.string().email().max(254).nullable(),
    education: z.array(educationSchema),
    projects: z.array(projectSchema),
    experience: z.array(experienceSchema),
    hackathons: z.array(experienceSchema),
    internships: z.array(experienceSchema),
    certifications: z.array(certificationSchema),
    preferred_roles: z.array(z.string()),
  }).strict(),
  warnings: z.array(z.string()),
}).strict();

export function parseResumeExtractionResult(value: unknown): ResumeExtractionResult {
  return resumeExtractionResultSchema.parse(value);
}
import { z } from "zod";
