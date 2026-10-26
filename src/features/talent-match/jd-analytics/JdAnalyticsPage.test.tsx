import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JdAnalyticsPage } from "./JdAnalyticsPage";
import { validateJdExtractionResult, type JdExtractionResult } from "./types";

const result: JdExtractionResult = {
  schema_version: "1.0.0",
  source_type: "jd",
  source_file: "role.pdf",
  company: null,
  role: "Software Engineer",
  location: null,
  skills: [
    {
      skill_name: "Python",
      category_code: "COD",
      evidence: "Build backend services using Python.",
      confidence: "high",
      requirement_type: "required",
      canonical_skill_key: "python",
    },
  ],
  warnings: ["Review priority wording."],
};

function selectPdf() {
  const file = new File(["job description"], "role.pdf", { type: "application/pdf" });
  fireEvent.change(screen.getByLabelText("Job description file"), { target: { files: [file] } });
}

describe("JdAnalyticsPage", () => {
  it("extracts, displays warnings and allows review edits before saving", async () => {
    const onExtract = vi.fn().mockResolvedValue(result);
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<JdAnalyticsPage onExtract={onExtract} onSave={onSave} />);

    selectPdf();
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));

    expect(await screen.findByText("Review extracted details")).toBeInTheDocument();
    expect(screen.getByText("Review priority wording.")).toBeInTheDocument();
    expect(
      screen.getByText(/responsibilities, and Required or Preferred sections/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/High: explicit and clear\. Medium: supported but needs interpretation/i),
    ).toBeInTheDocument();
    const categorySelect = screen.getByLabelText("RADIX category");
    expect(categorySelect).toHaveValue("COD");
    for (const category of ["COD", "SWE", "OTHER", "CLOUD"]) {
      expect(screen.getByRole("option", { name: category })).toBeInTheDocument();
    }
    expect(
      screen.queryByRole("option", { name: /Software Engineering|Outside the twelve/ }),
    ).toBeNull();
    fireEvent.change(screen.getByLabelText("Skill name"), { target: { value: "Python 3" } });
    fireEvent.click(screen.getByRole("button", { name: "Save reviewed job description" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: [expect.objectContaining({ skill_name: "Python 3" })],
        }),
      ),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("saved");
  });

  it("extracts a pasted job description", async () => {
    const onExtract = vi.fn().mockResolvedValue(result);
    render(<JdAnalyticsPage onExtract={onExtract} />);

    fireEvent.change(screen.getByLabelText("Or paste job description text"), {
      target: { value: "Build backend services using Python." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));

    expect(await screen.findByText("Review extracted details")).toBeInTheDocument();
    expect(onExtract).toHaveBeenCalledWith("Build backend services using Python.");
  });

  it("rejects unsupported and oversized files without calling extraction", () => {
    const onExtract = vi.fn();
    render(<JdAnalyticsPage onExtract={onExtract} />);
    const input = screen.getByLabelText("Job description file");
    fireEvent.change(input, {
      target: { files: [new File(["x"], "role.txt", { type: "text/plain" })] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a PDF or DOCX");
    expect(screen.getByRole("button", { name: "Analyze document" })).toBeDisabled();

    const large = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "role.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    fireEvent.change(input, { target: { files: [large] } });
    expect(screen.getByRole("alert")).toHaveTextContent("10 MB limit");
    expect(onExtract).not.toHaveBeenCalled();
  });

  it("shows extraction errors and keeps retry available", async () => {
    const onExtract = vi.fn().mockRejectedValueOnce(new Error("Provider unavailable"));
    render(<JdAnalyticsPage onExtract={onExtract} />);
    selectPdf();
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Provider unavailable");
    expect(screen.getByRole("button", { name: "Analyze document" })).toBeEnabled();
  });

  it("shows the extracted-text limit error and allows retry", async () => {
    const onExtract = vi
      .fn()
      .mockRejectedValueOnce(
        new Error(
          "The document contains more than the supported 80,000 characters of extracted text.",
        ),
      );
    render(<JdAnalyticsPage onExtract={onExtract} />);
    selectPdf();
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("80,000 characters");
    expect(screen.getByRole("button", { name: "Analyze document" })).toBeEnabled();
  });

  it("shows the API error when a success response body cannot be parsed", async () => {
    const onExtract = vi
      .fn()
      .mockRejectedValue(
        new Error("The extraction API returned an unreadable response. Retry analysis."),
      );
    render(<JdAnalyticsPage onExtract={onExtract} />);
    selectPdf();
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("unreadable response");
    expect(screen.queryByText("Review extracted details")).not.toBeInTheDocument();
  });

  it("surfaces empty HTTP-success-shaped callback results as extraction errors", async () => {
    const onExtract = vi.fn().mockResolvedValue({ ...result, skills: [] });
    render(<JdAnalyticsPage onExtract={onExtract} />);
    selectPdf();
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No skills were extracted");
    expect(screen.queryByText("Review extracted details")).not.toBeInTheDocument();
  });

  it("rejects invalid user edits before calling save", async () => {
    const onExtract = vi.fn().mockResolvedValue(result);
    const onSave = vi.fn();
    render(<JdAnalyticsPage onExtract={onExtract} onSave={onSave} />);
    selectPdf();
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));
    await screen.findByText("Review extracted details");
    fireEvent.change(screen.getByLabelText("Source evidence"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Save reviewed job description" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Fix the draft before saving");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not report success when the save callback fails", async () => {
    const onExtract = vi.fn().mockResolvedValue(result);
    const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));
    render(<JdAnalyticsPage onExtract={onExtract} onSave={onSave} />);
    selectPdf();
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));
    await screen.findByText("Review extracted details");
    fireEvent.click(screen.getByRole("button", { name: "Save reviewed job description" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Save failed");
    expect(screen.queryByText("Reviewed job description saved.")).not.toBeInTheDocument();
  });

  it("shows safe unavailable states when integration callbacks are missing", async () => {
    render(<JdAnalyticsPage />);
    expect(screen.getByRole("status")).toHaveTextContent("VITE_TALENT_MATCH_API_URL");
    expect(screen.getByRole("button", { name: "Analyze document" })).toBeDisabled();

    cleanup();
    render(<JdAnalyticsPage onExtract={vi.fn().mockResolvedValue(result)} />);
    selectPdf();
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));
    expect(await screen.findByText("Review extracted details")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "authenticated job-description persistence is not implemented",
    );
  });

  it("validates strict schema shape for API results and edited drafts", () => {
    expect(validateJdExtractionResult(result)).toEqual([]);
    expect(validateJdExtractionResult({ ...result, unexpected: true })).toContain(
      "The extraction result has unsupported fields.",
    );
    expect(
      validateJdExtractionResult({ ...result, skills: [{ ...result.skills[0], evidence: "" }] }),
    ).toContain("Skill 1 needs source evidence of 1–500 characters.");
  });
});
