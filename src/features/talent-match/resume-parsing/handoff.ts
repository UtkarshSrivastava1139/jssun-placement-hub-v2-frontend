import {
  blankProfile,
  type CandidateProfile,
  type Education,
  type ExperienceItem,
  type Project,
  type Certification,
} from "../profile-builder/types";
import { parseResumeExtractionResult, type ResumeExtractionResult } from "./types";

const HANDOFF_KEY = "talent-match.resume-profile-draft.v1";

function mapEducation(value: ResumeExtractionResult["candidate_details"]["education"]): Education[] {
  return value.map(({ evidence: _evidence, ...education }) => education);
}

function mapExperience(
  value: ResumeExtractionResult["candidate_details"]["experience"],
): ExperienceItem[] {
  return value.map(({ evidence: _evidence, ...experience }) => experience);
}

function mapProjects(value: ResumeExtractionResult["candidate_details"]["projects"]): Project[] {
  return value
    .filter((project) => project.title.trim())
    .map(({ evidence: _evidence, ...project }) => project);
}

function mapCertifications(
  value: ResumeExtractionResult["candidate_details"]["certifications"],
): Certification[] {
  return value
    .filter((certification) => certification.name.trim())
    .map(({ evidence: _evidence, ...certification }) => certification);
}

export function mapResumeDraftToProfile(
  draft: ResumeExtractionResult,
  baseProfile: CandidateProfile = blankProfile(),
): CandidateProfile {
  const details = draft.candidate_details;
  return {
    ...baseProfile,
    name: details.name ?? baseProfile.name,
    email: details.email ?? baseProfile.email,
    education: details.education.length ? mapEducation(details.education) : baseProfile.education,
    skills: draft.skills.length ? draft.skills.map((skill) => ({
      ...skill,
      provenance: "resume_extraction" as const,
    })) : baseProfile.skills,
    projects: details.projects.length ? mapProjects(details.projects) : baseProfile.projects,
    internships: details.internships.length ? mapExperience(details.internships) : baseProfile.internships,
    hackathons: details.hackathons.length ? mapExperience(details.hackathons) : baseProfile.hackathons,
    certifications: details.certifications.length
      ? mapCertifications(details.certifications)
      : baseProfile.certifications,
    preferred_roles: details.preferred_roles.length
      ? details.preferred_roles
      : baseProfile.preferred_roles,
    resume_metadata: {
      original_filename: draft.source_file,
      parsed_at: new Date().toISOString(),
      raw_file_retained: false,
    },
  };
}

export function storeResumeDraftForProfile(draft: ResumeExtractionResult): boolean {
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function consumeResumeDraftForProfile(): ResumeExtractionResult | null {
  try {
    const stored = sessionStorage.getItem(HANDOFF_KEY);
    if (!stored) return null;
    sessionStorage.removeItem(HANDOFF_KEY);
    return parseResumeExtractionResult(JSON.parse(stored));
  } catch {
    try {
      sessionStorage.removeItem(HANDOFF_KEY);
    } catch {
      // Storage can be unavailable in privacy-restricted browsers.
    }
    return null;
  }
}
