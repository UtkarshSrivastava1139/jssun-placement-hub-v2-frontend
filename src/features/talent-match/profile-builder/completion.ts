import type { CandidateProfile } from "./types";

export type ProfileCompletion = {
  sections: Record<string, boolean>;
  completed: number;
  total: number;
  percent: number;
  unassessed: number;
  ready: boolean;
};

function hasText(value: string | null): boolean {
  return Boolean(value?.trim());
}

export function getProfileCompletion(profile: CandidateProfile): ProfileCompletion {
  const sections = {
    identity: hasText(profile.name),
    education: profile.education.some(
      (item) =>
        hasText(item.degree) ||
        hasText(item.institution) ||
        hasText(item.field_of_study) ||
        item.graduation_year !== null,
    ),
    skills: profile.skills.some((item) => hasText(item.skill_name) || hasText(item.evidence)),
    projects: profile.projects.some(
      (item) =>
        hasText(item.title) ||
        hasText(item.description) ||
        item.technologies.length > 0 ||
        hasText(item.outcome),
    ),
    experience: [...profile.internships, ...profile.hackathons].some(
      (item) =>
        hasText(item.title) ||
        hasText(item.organization) ||
        hasText(item.start_date) ||
        hasText(item.end_date) ||
        hasText(item.description),
    ),
    certifications: profile.certifications.some(
      (item) => hasText(item.name) || hasText(item.issuer) || hasText(item.issued_date),
    ),
    roles: profile.preferred_roles.some((role) => hasText(role)),
    assessments: profile.category_assessments.every(
      (assessment) => assessment.self_assessed_level !== null,
    ),
  };
  const total = Object.keys(sections).length;
  const completed = Object.values(sections).filter(Boolean).length;
  const unassessed = profile.category_assessments.filter(
    (assessment) => assessment.self_assessed_level === null,
  ).length;

  return {
    sections,
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    unassessed,
    ready: sections.identity && sections.assessments,
  };
}
