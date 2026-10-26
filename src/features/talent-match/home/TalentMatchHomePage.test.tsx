import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TalentMatchHttpError } from "../api/client";
import { TalentMatchHomePage } from "./TalentMatchHomePage";

const request = vi.fn();
vi.mock("../api/client", () => ({
  talentMatchRequest: (...args: unknown[]) => request(...args),
  TalentMatchHttpError: class TalentMatchHttpError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));
vi.mock("../auth/talentMatchSupabaseClient", () => ({
  ensureTalentMatchSession: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

const emptyJd = { items: [] };
const emptyAssessments = { items: [] };

function respond(profile: unknown, jobs = emptyJd, assessments = emptyAssessments) {
  request.mockImplementation((path: string) => {
    if (path === "/api/v1/profile") return profile instanceof Error ? Promise.reject(profile) : Promise.resolve(profile);
    if (path === "/api/v1/job-descriptions") return Promise.resolve(jobs);
    return Promise.resolve(assessments);
  });
}

describe("TalentMatchHomePage", () => {
  beforeEach(() => {
    request.mockReset();
  });

  it("welcomes a new user and points them to their resume", async () => {
    respond(new TalentMatchHttpError("not found", 404));
    render(<TalentMatchHomePage />);
    expect(await screen.findByRole("heading", { name: "Start with your resume" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upload your resume" })).toHaveAttribute("href", "/talent-match/resume-parsing");
  });

  it("points a profiled user without a JD to the job description step", async () => {
    respond({
      profile_id: "p1",
      profile: { skills: [{ provenance: "resume_extraction" }] },
      updated_at: "2026-10-25T00:00:00Z",
    });
    render(<TalentMatchHomePage />);
    expect(await screen.findByRole("link", { name: "Continue with Job Description" })).toHaveAttribute("href", "/talent-match/jd-analytics");
  });

  it("shows the latest readiness and match cards", async () => {
    respond(
      { profile_id: "p1", profile: { skills: [{ provenance: "resume_extraction" }] } },
      { items: [{ job_description_id: "j1", extraction: { role: "Frontend Engineer" }, created_at: "2026-10-25T00:00:00Z" }] },
      { items: [
        { assessment_id: "a1", assessment_type: "talent_check", company_key: "google", score: 82, created_at: "2026-10-25T00:00:00Z", job_description_id: null },
        { assessment_id: "a2", assessment_type: "skill_match", company_key: null, score: 74, created_at: "2026-10-26T00:00:00Z", job_description_id: "j1" },
      ] },
    );
    render(<TalentMatchHomePage />);
    expect(await screen.findByText("82")).toBeInTheDocument();
    expect(screen.getByText("74")).toBeInTheDocument();
    expect(screen.getByText(/Google LLC/)).toBeInTheDocument();
    expect(screen.getByText(/Frontend Engineer/)).toBeInTheDocument();
  });

  it("renders a friendly error state when progress cannot be loaded", async () => {
    respond(new Error("backend unavailable"));
    request.mockImplementation(() => Promise.reject(new Error("backend unavailable")));
    render(<TalentMatchHomePage />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByText("We couldn’t load your progress")).toBeInTheDocument();
    expect(screen.queryByText("backend unavailable")).not.toBeInTheDocument();
  });
});
