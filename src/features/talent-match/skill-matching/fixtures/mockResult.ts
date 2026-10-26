/**
 * SYNTHETIC DEVELOPMENT-ONLY FIXTURE.
 * Used for development preview, state mocking, and component tests only.
 * Contains no real candidate PII or real company expectations.
 */

import type { SkillMatchResult } from "../types";
import type { SavedJobDescriptionRecord } from "../../jd-analytics/types";

export const SYNTHETIC_SAVED_JOB_DESCRIPTION: SavedJobDescriptionRecord = {
  job_description_id: "11111111-1111-1111-1111-111111111111",
  schema_version: "1.0.0",
  created_at: "2026-10-25T12:00:00Z",
  extraction: {
    schema_version: "1.0.0",
    source_type: "jd",
    source_file: "synthetic-backend-engineer.txt",
    company: "SynthCo Technologies",
    role: "Backend Platform Engineer",
    location: null,
    skills: [
      {
        skill_name: "Python",
        category_code: "COD",
        evidence: "Strong Python skills required for developing high-throughput microservices.",
        confidence: "high",
        requirement_type: "required",
      },
      {
        skill_name: "FastAPI",
        category_code: "COD",
        evidence: "Experience architecting APIs with FastAPI is strictly required.",
        confidence: "high",
        requirement_type: "required",
      },
      {
        skill_name: "PostgreSQL",
        category_code: "SQL",
        evidence: "Relational database schema design and PostgreSQL query tuning required.",
        confidence: "high",
        requirement_type: "required",
      },
    ],
    warnings: ["Development-only synthetic fixture; not a real job description."],
  },
};

export const SYNTHETIC_MOCK_SKILL_MATCH_RESULT: SkillMatchResult = {
  schema_version: "1.0.0",
  assessment_id: "c71ae13c-dde0-4f1b-987b-dddaebe53d44",
  profile_id: "22222222-2222-2222-2222-222222222222",
  job_description_id: "11111111-1111-1111-1111-111111111111",
  company: "SynthCo Technologies",
  role: "Backend Platform Engineer",
  match_score: 82,
  scoring_version: "sm-v1",
  created_at: "2026-10-25T12:00:00Z",
  matched_skills: [
    {
      requirement: {
        skill_name: "Python",
        category_code: "COD",
        evidence: "Strong Python skills required for developing high-throughput microservices.",
        confidence: "high",
        requirement_type: "required",
        weight: 2,
      },
      candidate_skill_name: "Python",
      candidate_evidence: "Built REST microservices using Python for 2 years in capstone project.",
      match_method: "exact",
    },
    {
      requirement: {
        skill_name: "FastAPI",
        category_code: "COD",
        evidence: "Experience architecting APIs with FastAPI is strictly required.",
        confidence: "high",
        requirement_type: "required",
        weight: 2,
      },
      candidate_skill_name: "FastAPI",
      candidate_evidence: "Developed async endpoints with FastAPI and Pydantic validation.",
      match_method: "exact",
    },
    {
      requirement: {
        skill_name: "PostgreSQL",
        category_code: "SQL",
        evidence: "Relational database schema design and PostgreSQL query tuning required.",
        confidence: "high",
        requirement_type: "required",
        weight: 2,
      },
      candidate_skill_name: "Postgres",
      candidate_evidence: "Administered PostgreSQL databases and wrote indexing migrations.",
      match_method: "alias",
    },
    {
      requirement: {
        skill_name: "Docker",
        category_code: "CLOUD",
        evidence: "Containerisation with Docker required for local development and CI/CD.",
        confidence: "high",
        requirement_type: "required",
        weight: 2,
      },
      candidate_skill_name: "Docker",
      candidate_evidence: "Wrote multi-stage Dockerfiles for Python services.",
      match_method: "exact",
    },
    {
      requirement: {
        skill_name: "AWS",
        category_code: "CLOUD",
        evidence: "Cloud deployment experience on AWS (EC2, S3, RDS) preferred.",
        confidence: "medium",
        requirement_type: "preferred",
        weight: 1,
      },
      candidate_skill_name: "Amazon Web Services",
      candidate_evidence: "Deployed containers on AWS ECS and managed S3 buckets.",
      match_method: "alias",
    },
  ],
  possible_matches: [
    {
      requirement: {
        skill_name: "Kubernetes",
        category_code: "CLOUD",
        evidence: "Kubernetes orchestration and Helm chart management preferred.",
        confidence: "medium",
        requirement_type: "preferred",
        weight: 1,
      },
      candidate_skill_name: "Kubernets",
      candidate_evidence: "Configured Kubernets manifests for test cluster.",
      similarity: 94.74,
      review_status: "pending_candidate_review",
    },
  ],
  missing_skills: [
    {
      skill_name: "System Design",
      category_code: "SYSD",
      evidence: "Knowledge of distributed system design patterns and caching strategies required.",
      confidence: "high",
      requirement_type: "required",
      weight: 2,
    },
    {
      skill_name: "Git",
      category_code: "SWE",
      evidence: "Proficiency in Git version control and collaborative workflows.",
      confidence: "medium",
      requirement_type: "unknown",
      weight: 1,
    },
  ],
  summary: {
    unique_requirements: 8,
    confirmed_matches: 5,
    possible_count: 1,
    missing_count: 2,
    interpretation_notice:
      "Match score reflects confirmed requirement coverage only (sm-v1 weighted: required=2, preferred=1, unknown=1). Possible matches are excluded. This is not a prediction of hiring probability.",
  },
};

export const SYNTHETIC_EMPTY_SKILLS_RESULT: SkillMatchResult = {
  schema_version: "1.0.0",
  assessment_id: "e0000000-0000-0000-0000-000000000001",
  profile_id: "22222222-2222-2222-2222-222222222222",
  job_description_id: "11111111-1111-1111-1111-111111111111",
  company: "SynthCo Technologies",
  role: "Backend Platform Engineer",
  match_score: 0,
  scoring_version: "sm-v1",
  created_at: "2026-10-25T12:00:00Z",
  matched_skills: [],
  possible_matches: [],
  missing_skills: [
    {
      skill_name: "Python",
      category_code: "COD",
      evidence: "Python required.",
      confidence: "high",
      requirement_type: "required",
      weight: 2,
    },
  ],
  summary: {
    unique_requirements: 1,
    confirmed_matches: 0,
    possible_count: 0,
    missing_count: 1,
    interpretation_notice:
      "Match score reflects confirmed requirement coverage only (sm-v1 weighted: required=2, preferred=1, unknown=1). Possible matches are excluded. This is not a prediction of hiring probability.",
  },
};
