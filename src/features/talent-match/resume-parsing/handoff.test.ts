import { describe, expect, it } from "vitest";
import {
  consumeResumeDraftForProfile,
  mapResumeDraftToProfile,
  storeResumeDraftForProfile,
} from "./handoff";
import { blankProfile } from "../profile-builder/types";
import type { ResumeExtractionResult } from "./types";

const draft: ResumeExtractionResult = {
  schema_version: "1.0.0",
  source_type: "resume",
  source_file: "resume.pdf",
  company: null,
  role: null,
  location: null,
  skills: [{
    skill_name: "Python",
    category_code: "COD",
    evidence: "Python",
    confidence: "high",
    canonical_skill_key: "python",
  }],
  candidate_details: {
    name: "Jordan Lee",
    email: "jordan@example.com",
    education: [{
      degree: "B.Tech",
      institution: "JSS University",
      field_of_study: "Computer Science",
      graduation_year: 2025,
      evidence: "B.Tech at JSS University",
    }],
    projects: [{
      title: "Dashboard",
      description: "Built a dashboard.",
      technologies: ["Python"],
      outcome: null,
      evidence: "Dashboard: Built a dashboard.",
    }],
    experience: [],
    hackathons: [],
    internships: [],
    certifications: [],
    preferred_roles: ["Software Engineer"],
  },
  warnings: [],
};

describe("resume/profile handoff", () => {
  it("maps only compatible source fields and preserves unassessed levels", () => {
    const profile = mapResumeDraftToProfile(draft);

    expect(profile.name).toBe("Jordan Lee");
    expect(profile.skills[0]).toMatchObject({
      skill_name: "Python",
      category_code: "COD",
      provenance: "resume_extraction",
      evidence: "Python",
      confidence: "high",
    });
    expect(profile.education[0]).toMatchObject({
      degree: "B.Tech",
      institution: "JSS University",
    });
    expect(profile.category_assessments.every((item) => item.self_assessed_level === null)).toBe(true);
    expect(profile.resume_metadata.raw_file_retained).toBe(false);
  });

  it("round-trips a draft through temporary session storage", () => {
    expect(storeResumeDraftForProfile(draft)).toBe(true);
    expect(consumeResumeDraftForProfile()).toEqual(draft);
    expect(consumeResumeDraftForProfile()).toBeNull();
  });

  it("returns null rather than crashing for malformed stored data", () => {
    sessionStorage.setItem("talent-match.resume-profile-draft.v1", JSON.stringify({ invalid: true }));
    expect(consumeResumeDraftForProfile()).toBeNull();
    expect(blankProfile().name).toBe("");
  });
});
