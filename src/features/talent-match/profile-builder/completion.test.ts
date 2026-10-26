import { describe, expect, it } from "vitest";
import { blankProfile, RADIX_CATEGORIES } from "./types";
import { getProfileCompletion } from "./completion";

describe("profile completion", () => {
  it("does not count an empty saved draft as ready", () => {
    const completion = getProfileCompletion(blankProfile());

    expect(completion.percent).toBe(0);
    expect(completion.unassessed).toBe(12);
    expect(completion.ready).toBe(false);
    expect(completion.sections.assessments).toBe(false);
  });

  it("requires all twelve numeric assessments and a name for readiness", () => {
    const profile = blankProfile();
    profile.name = "Candidate";
    profile.category_assessments = RADIX_CATEGORIES.map((category_code) => ({
      category_code,
      self_assessed_level: 5,
      assessment_basis: "candidate_self_assessment" as const,
      evidence_note: null,
    }));

    const completion = getProfileCompletion(profile);

    expect(completion.unassessed).toBe(0);
    expect(completion.sections.assessments).toBe(true);
    expect(completion.ready).toBe(true);
    expect(completion.completed).toBe(2);
    expect(completion.percent).toBe(25);
  });

  it("counts only populated repeatable sections", () => {
    const profile = blankProfile();
    profile.name = "Candidate";
    profile.preferred_roles = ["Backend Developer"];
    profile.education = [
      { degree: null, institution: null, field_of_study: null, graduation_year: null },
    ];
    profile.projects = [{ title: "Project", description: null, technologies: [], outcome: null }];

    const completion = getProfileCompletion(profile);

    expect(completion.sections.identity).toBe(true);
    expect(completion.sections.roles).toBe(true);
    expect(completion.sections.projects).toBe(true);
    expect(completion.sections.education).toBe(false);
    expect(completion.completed).toBe(3);
  });
});
