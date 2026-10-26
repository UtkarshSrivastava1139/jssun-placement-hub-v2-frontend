/**
 * Tests for ResumeDraftReview component.
 * Verifies rendering with fixture data, warnings, skills with evidence,
 * and the "Use this draft in Profile Builder" action.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResumeDraftReview } from "./ResumeDraftReview";
import type { ResumeExtractionResult } from "./types";

const MOCK_RESULT: ResumeExtractionResult = {
  schema_version: "1.0.0",
  source_type: "resume",
  source_file: "test_resume.pdf",
  company: null,
  role: null,
  location: null,
  skills: [
    {
      skill_name: "Python",
      category_code: "COD",
      evidence: "Python listed in skills section",
      confidence: "high",
      canonical_skill_key: "python",
    },
    {
      skill_name: "Docker",
      category_code: "CLOUD",
      evidence: "Docker used for deployment",
      confidence: "medium",
      canonical_skill_key: "docker",
    },
    {
      skill_name: "Quantum Computing",
      category_code: "OTHER",
      evidence: "Mentioned in project description",
      confidence: "low",
      canonical_skill_key: "quantum computing",
    },
  ],
  candidate_details: {
    name: "Test Candidate",
    email: "test@example.com",
    education: [
      {
        degree: "B.Tech in Computer Science",
        institution: "Test University",
        field_of_study: "Computer Science",
        graduation_year: 2025,
        evidence: "B.Tech in Computer Science",
      },
    ],
    projects: [
      {
        title: "Test Project",
        description: "A test project description",
        technologies: ["Python", "React"],
        outcome: "Successfully deployed",
        evidence: "Projects section",
      },
    ],
    experience: [
      {
        title: "Software Developer",
        organization: "Test Corp",
        start_date: "Jan 2024",
        end_date: "Jun 2024",
        description: "Built REST APIs",
        evidence: "Experience section",
      },
    ],
    hackathons: [],
    internships: [],
    certifications: [
      {
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        issued_date: "2023",
        evidence: "Certifications section",
      },
    ],
    preferred_roles: [],
  },
  warnings: ["Low confidence skill: Quantum Computing"],
};

describe("ResumeDraftReview", () => {
  it("renders candidate name and email", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(screen.getByText("Test Candidate")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders all extracted skills with evidence", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    // Skills appear in both skill name and evidence, so use getAllByText
    const pythonElements = screen.getAllByText("Python");
    expect(pythonElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("Quantum Computing")).toBeInTheDocument();
    expect(screen.getByText("Python listed in skills section")).toBeInTheDocument();
  });

  it("shows category labels for skills", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(screen.getByText("Coding")).toBeInTheDocument();
    expect(screen.getByText("Cloud")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("shows confidence indicators", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("low")).toBeInTheDocument();
  });

  it("renders warnings section when warnings exist", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(screen.getByText(/Extraction Warnings/)).toBeInTheDocument();
    expect(
      screen.getByText("Low confidence skill: Quantum Computing"),
    ).toBeInTheDocument();
  });

  it("renders education section with degree and institution", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("B.Tech in Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Test University")).toBeInTheDocument();
  });

  it("renders experience section with title and dates", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(screen.getByText("Work Experience")).toBeInTheDocument();
    expect(screen.getByText("Software Developer")).toBeInTheDocument();
    expect(screen.getByText("Test Corp")).toBeInTheDocument();
  });

  it("renders certifications section", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(screen.getByText("Certifications")).toBeInTheDocument();
    expect(screen.getByText("AWS Certified Developer")).toBeInTheDocument();
    expect(screen.getByText("Amazon Web Services")).toBeInTheDocument();
  });

  it("renders the 'Use this draft in Profile Builder' button", () => {
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Use this draft in Profile Builder"),
    ).toBeInTheDocument();
  });

  it("calls onUseInProfileBuilder when button is clicked", () => {
    const onUse = vi.fn();
    render(
      <ResumeDraftReview
        result={MOCK_RESULT}
        onUseInProfileBuilder={onUse}
      />,
    );

    fireEvent.click(
      screen.getByText("Use this draft in Profile Builder"),
    );

    expect(onUse).toHaveBeenCalledTimes(1);
  });

  it("shows 'Not found in resume' for null fields", () => {
    const resultWithNulls: ResumeExtractionResult = {
      ...MOCK_RESULT,
      candidate_details: {
        ...MOCK_RESULT.candidate_details,
        name: null,
        email: null,
      },
    };

    render(
      <ResumeDraftReview
        result={resultWithNulls}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    const notFoundMessages = screen.getAllByText(/Not found in resume/i);
    expect(notFoundMessages.length).toBeGreaterThanOrEqual(2);
  });

  it("renders empty state for skills when no skills found", () => {
    const emptyResult: ResumeExtractionResult = {
      ...MOCK_RESULT,
      skills: [],
    };

    render(
      <ResumeDraftReview
        result={emptyResult}
        onUseInProfileBuilder={vi.fn()}
      />,
    );

    expect(
      screen.getByText("No skills were identified in the resume."),
    ).toBeInTheDocument();
  });
});
