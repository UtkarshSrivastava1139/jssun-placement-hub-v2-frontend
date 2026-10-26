/**
 * Tests for ResumeUploadZone component.
 * Verifies rendering, file validation, and error display.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResumeUploadZone } from "./ResumeUploadZone";

describe("ResumeUploadZone", () => {
  it("renders the upload prompt text", () => {
    render(<ResumeUploadZone onFileSelected={vi.fn()} />);

    expect(
      screen.getByText("Drop your resume here or click to browse"),
    ).toBeInTheDocument();
  });

  it("shows file type and size constraints", () => {
    render(<ResumeUploadZone onFileSelected={vi.fn()} />);

    expect(screen.getByText(/PDF or DOCX, up to 10 MB/i)).toBeInTheDocument();
  });

  it("shows privacy notice about raw file not being stored", () => {
    render(<ResumeUploadZone onFileSelected={vi.fn()} />);

    expect(
      screen.getByText(/raw file is not stored after processing/i),
    ).toBeInTheDocument();
  });

  it("calls onFileSelected when a valid PDF is selected", () => {
    const onFileSelected = vi.fn();
    render(<ResumeUploadZone onFileSelected={onFileSelected} />);

    const input = screen
      .getByLabelText("Select resume file") as HTMLInputElement;

    const file = new File(["mock content"], "resume.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", { value: 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it("rejects non-PDF/DOCX files and shows error", () => {
    const onFileSelected = vi.fn();
    render(<ResumeUploadZone onFileSelected={onFileSelected} />);

    const input = screen
      .getByLabelText("Select resume file") as HTMLInputElement;

    const file = new File(["text content"], "resume.txt", {
      type: "text/plain",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelected).not.toHaveBeenCalled();
    expect(screen.getByText(/Upload a PDF or DOCX file/i)).toBeInTheDocument();
  });

  it("rejects empty files", () => {
    const onFileSelected = vi.fn();
    render(<ResumeUploadZone onFileSelected={onFileSelected} />);

    const input = screen
      .getByLabelText("Select resume file") as HTMLInputElement;

    const file = new File([], "empty.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 0 });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelected).not.toHaveBeenCalled();
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });

  it("displays external error message when provided", () => {
    render(
      <ResumeUploadZone
        onFileSelected={vi.fn()}
        error="Server error occurred"
      />,
    );

    expect(screen.getByText("Server error occurred")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<ResumeUploadZone onFileSelected={vi.fn()} disabled />);

    const uploadArea = screen.getByRole("button");
    expect(uploadArea).toHaveAttribute("aria-disabled", "true");
  });

  it("supports keyboard activation", () => {
    const onFileSelected = vi.fn();
    render(<ResumeUploadZone onFileSelected={onFileSelected} />);

    const uploadArea = screen.getByRole("button");
    expect(uploadArea).toHaveAttribute("tabIndex", "0");
  });
});
