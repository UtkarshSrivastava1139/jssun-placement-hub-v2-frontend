/**
 * Tests for ResumeParsingPage component.
 * Verifies state machine transitions, error handling, and reset behavior.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResumeParsingPage } from "./ResumeParsingPage";
import type { ResumeExtractionResult } from "./types";

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock("../auth/talentMatchSupabaseClient", () => ({
  ensureTalentMatchSession: vi.fn().mockResolvedValue(undefined),
}));

// Mock the API module
vi.mock("./api", () => ({
  extractResume: vi.fn(),
  validateFile: vi.fn((file: File) => {
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".docx"))
      return "Upload a PDF or DOCX file.";
    if (file.size > 10 * 1024 * 1024) return "File size exceeds the 10 MB limit.";
    if (file.size === 0) return "The selected file is empty.";
    return null;
  }),
  ResumeParsingError: class ResumeParsingError extends Error {
    code: string;
    requestId: string;
    constructor(code: string, message: string, requestId: string) {
      super(message);
      this.code = code;
      this.requestId = requestId;
    }
  },
}));

import { extractResume, ResumeParsingError } from "./api";

const MOCK_EXTRACTION_RESULT: ResumeExtractionResult = {
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
      evidence: "Python in skills section",
      confidence: "high",
      canonical_skill_key: "python",
    },
  ],
  candidate_details: {
    name: "Test User",
    email: "test@example.com",
    education: [],
    projects: [],
    experience: [],
    hackathons: [],
    internships: [],
    certifications: [],
    preferred_roles: [],
  },
  warnings: [],
};

describe("ResumeParsingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("shows upload zone in idle state", () => {
    render(<ResumeParsingPage />);

    expect(
      screen.getByText("Drop your resume here or click to browse"),
    ).toBeInTheDocument();
    expect(screen.getByText("Resume Parsing")).toBeInTheDocument();
  });

  it("shows processing state when file is uploaded", async () => {
    vi.mocked(extractResume).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(MOCK_EXTRACTION_RESULT), 100),
        ),
    );

    render(<ResumeParsingPage />);

    const input = screen.getByLabelText("Select resume file") as HTMLInputElement;
    const file = new File(["mock"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    // Should show processing message
    await waitFor(() => {
      expect(screen.getByText("Parsing resume content...")).toBeInTheDocument();
    });
  });

  it("shows draft review after successful extraction", async () => {
    vi.mocked(extractResume).mockResolvedValue(MOCK_EXTRACTION_RESULT);

    render(<ResumeParsingPage />);

    const input = screen.getByLabelText("Select resume file") as HTMLInputElement;
    const file = new File(["mock"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Use this draft in Profile Builder"),
    ).toBeInTheDocument();
  });

  it("shows error state when extraction fails", async () => {
    vi.mocked(extractResume).mockRejectedValue(
      new ResumeParsingError("INVALID_FILE_TYPE", "The file could not be parsed.", "test-req"),
    );

    render(<ResumeParsingPage />);

    const input = screen.getByLabelText("Select resume file") as HTMLInputElement;
    const file = new File(["mock"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("The file could not be parsed.")).toBeInTheDocument();
    });
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("resets to idle state when 'Try again' is clicked", async () => {
    vi.mocked(extractResume).mockRejectedValue(
      new ResumeParsingError("INVALID_FILE_TYPE", "Parse failed.", "test-req"),
    );

    render(<ResumeParsingPage />);

    const input = screen.getByLabelText("Select resume file") as HTMLInputElement;
    const file = new File(["mock"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Parse failed.")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Try again"));

    expect(
      screen.getByText("Drop your resume here or click to browse"),
    ).toBeInTheDocument();
  });

  it("resets to idle state when 'Parse another resume' is clicked", async () => {
    vi.mocked(extractResume).mockResolvedValue(MOCK_EXTRACTION_RESULT);

    render(<ResumeParsingPage />);

    const input = screen.getByLabelText("Select resume file") as HTMLInputElement;
    const file = new File(["mock"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Use this draft in Profile Builder")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Parse another resume"));

    expect(
      screen.getByText("Drop your resume here or click to browse"),
    ).toBeInTheDocument();
  });

  it("stores the validated draft and navigates to Profile Builder", async () => {
    vi.mocked(extractResume).mockResolvedValue(MOCK_EXTRACTION_RESULT);

    render(<ResumeParsingPage />);

    const input = screen.getByLabelText("Select resume file") as HTMLInputElement;
    const file = new File(["mock"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Use this draft in Profile Builder")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Use this draft in Profile Builder"));

    expect(mockNavigate).toHaveBeenCalledWith({ to: "/talent-match/profile" });
    expect(sessionStorage.length).toBe(1);
  });

  it("shows filename after file is selected", async () => {
    vi.mocked(extractResume).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(MOCK_EXTRACTION_RESULT), 100),
        ),
    );

    render(<ResumeParsingPage />);

    const input = screen.getByLabelText("Select resume file") as HTMLInputElement;
    const file = new File(["mock"], "my_resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("my_resume.pdf")).toBeInTheDocument();
    });
  });
});
