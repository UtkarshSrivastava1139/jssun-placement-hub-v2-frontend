import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SkillMatchingPage from "./SkillMatchingPage";
import { SYNTHETIC_MOCK_SKILL_MATCH_RESULT } from "./fixtures/mockResult";
import type { SkillMatchResult } from "./types";

describe("SkillMatchingPage Component", () => {
  const jdId = "11111111-1111-1111-1111-111111111111";

  it("renders idle state with action button when initialResult is not provided", () => {
    render(<SkillMatchingPage jobDescriptionId={jdId} />);

    expect(screen.getByText("Ready to Match Skills")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run skill match/i })).toBeInTheDocument();
  });

  it("renders a clear error state when no job description is selected", () => {
    render(<SkillMatchingPage jobDescriptionId="" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("No Job Description Selected")).toBeInTheDocument();
    expect(
      screen.getByText("Select a job description before running skill matching."),
    ).toBeInTheDocument();
  });

  it("renders ready state immediately when initialResult is provided", () => {
    render(
      <SkillMatchingPage
        jobDescriptionId={jdId}
        initialResult={SYNTHETIC_MOCK_SKILL_MATCH_RESULT}
      />,
    );

    expect(screen.getByText("Skill Match Analysis")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("SynthCo Technologies", { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/confirmed matches \(5\)/i)).toBeInTheDocument();
    expect(screen.getByText(/possible matches under review \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/missing requirements \(2\)/i)).toBeInTheDocument();
  });

  it("executes match on button click, shows processing, and transitions to ready state", async () => {
    const mockRun = vi.fn().mockResolvedValue(SYNTHETIC_MOCK_SKILL_MATCH_RESULT);

    render(<SkillMatchingPage jobDescriptionId={jdId} runSkillMatch={mockRun} />);

    const runButton = screen.getByRole("button", { name: /run skill match/i });
    fireEvent.click(runButton);

    expect(mockRun).toHaveBeenCalledWith(jdId);
    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Skill Match Analysis")).toBeInTheDocument();
    });

    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("expands calculation disclosure when clicked", () => {
    render(
      <SkillMatchingPage
        jobDescriptionId={jdId}
        initialResult={SYNTHETIC_MOCK_SKILL_MATCH_RESULT}
      />,
    );

    const disclosureBtn = screen.getByRole("button", {
      name: /how is this score calculated\?/i,
    });
    expect(disclosureBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(disclosureBtn);
    expect(disclosureBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/deterministic sm-v1 scoring formula/i)).toBeInTheDocument();
    expect(screen.getByText(/possible matches policy/i)).toBeInTheDocument();
  });

  it("renders error state with retry button on general failure", async () => {
    const mockRun = vi.fn().mockRejectedValue({
      code: "JOB_DESCRIPTION_NOT_FOUND",
      message: "Job description not found or access denied.",
      request_id: "req-err-404",
    });

    render(<SkillMatchingPage jobDescriptionId={jdId} runSkillMatch={mockRun} />);

    const runButton = screen.getByRole("button", { name: /run skill match/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("Match Request Failed")).toBeInTheDocument();
    expect(screen.getByText("Job description not found or access denied.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("renders empty state when error code is NO_SKILLS_EXTRACTED", async () => {
    const mockRun = vi.fn().mockRejectedValue({
      code: "NO_SKILLS_EXTRACTED",
      message: "No skills were extracted from this job description to match against.",
      request_id: "req-err-409",
    });

    render(<SkillMatchingPage jobDescriptionId={jdId} runSkillMatch={mockRun} />);

    fireEvent.click(screen.getByRole("button", { name: /run skill match/i }));

    await waitFor(() => {
      expect(screen.getByText("No Requirements Detected in Job Description")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /retry match/i })).toBeInTheDocument();
  });

  it("renders empty state when error code is PROFILE_HAS_NO_SKILLS", async () => {
    const mockRun = vi.fn().mockRejectedValue({
      code: "PROFILE_HAS_NO_SKILLS",
      message: "Candidate profile contains no skills to match against.",
      request_id: "req-err-409-profile",
    });

    render(<SkillMatchingPage jobDescriptionId={jdId} runSkillMatch={mockRun} />);

    fireEvent.click(screen.getByRole("button", { name: /run skill match/i }));

    await waitFor(() => {
      expect(screen.getByText("Candidate Profile Has No Skills")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Candidate profile contains no skills to match against."),
    ).toBeInTheDocument();
  });

  it("prevents double submission while processing", async () => {
    let resolvePromise: (val: SkillMatchResult) => void = () => {};
    const deferredPromise = new Promise<SkillMatchResult>((resolve) => {
      resolvePromise = resolve;
    });

    const mockRun = vi.fn().mockReturnValue(deferredPromise);

    render(<SkillMatchingPage jobDescriptionId={jdId} runSkillMatch={mockRun} />);

    const runButton = screen.getByRole("button", { name: /run skill match/i });
    fireEvent.click(runButton);

    expect(mockRun).toHaveBeenCalledTimes(1);

    // Click again while still in processing
    fireEvent.click(runButton);
    expect(mockRun).toHaveBeenCalledTimes(1);

    // Resolve deferred promise
    resolvePromise(SYNTHETIC_MOCK_SKILL_MATCH_RESULT);

    await waitFor(() => {
      expect(screen.getByText("Skill Match Analysis")).toBeInTheDocument();
    });
  });

  it("displays missing skills with visible unknown priority markings", () => {
    render(
      <SkillMatchingPage
        jobDescriptionId={jdId}
        initialResult={SYNTHETIC_MOCK_SKILL_MATCH_RESULT}
      />,
    );

    // Required skill has required badge
    expect(screen.getByText("Required (Weight 2)")).toBeInTheDocument();
    // Unknown priority skill has distinct visible marking
    expect(screen.getByText("[UNKNOWN PRIORITY — WEIGHT 1]")).toBeInTheDocument();
  });

  it("puts missing skills before matched and possible sections", () => {
    render(
      <SkillMatchingPage
        jobDescriptionId={jdId}
        initialResult={SYNTHETIC_MOCK_SKILL_MATCH_RESULT}
      />,
    );

    const headings = screen.getAllByRole("heading").map((heading) => heading.textContent);
    expect(headings.indexOf("Missing Requirements (2)")).toBeLessThan(
      headings.indexOf("Confirmed Matches (5)"),
    );
    expect(headings.indexOf("Confirmed Matches (5)")).toBeLessThan(
      headings.indexOf("Possible Matches Under Review (1)"),
    );
    expect(screen.getByText("Possible matches do not change the score")).toBeInTheDocument();
  });
});
