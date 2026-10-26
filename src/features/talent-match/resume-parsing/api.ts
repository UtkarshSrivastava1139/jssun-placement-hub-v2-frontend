/**
 * API client for the resume parsing endpoint.
 *
 * Calls POST /api/v1/resume-parsing/extract with a multipart file upload.
 * Uses the shared Talent Match API client for authentication and transport.
 */

import { TalentMatchHttpError, talentMatchRequest } from "../api/client";
import { parseResumeExtractionResult, type ResumeExtractionResult } from "./types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

export class ResumeParsingError extends Error {
  code: string;
  requestId: string;

  constructor(code: string, message: string, requestId: string) {
    super(message);
    this.name = "ResumeParsingError";
    this.code = code;
    this.requestId = requestId;
  }
}

/**
 * Validate a file before upload. Returns an error message or null.
 */
export function validateFile(file: File): string | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return "Upload a PDF or DOCX file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds the 10 MB limit.";
  }
  if (file.size === 0) {
    return "The selected file is empty.";
  }
  return null;
}

/**
 * Upload a resume file and get the extraction result.
 *
 * @param file - The PDF or DOCX file to parse.
 * @returns Promise resolving to a ResumeExtractionResult.
 * @throws {ResumeParsingError} on validation or API errors.
 */
export async function extractResume(
  file: File,
): Promise<ResumeExtractionResult> {
  const validationError = validateFile(file);
  if (validationError) {
    throw new ResumeParsingError("INVALID_FILE_TYPE", validationError, "client");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await talentMatchRequest<unknown>(
      "/api/v1/resume-parsing/extract",
      { method: "POST", body: formData },
    );
    try {
      return parseResumeExtractionResult(response);
    } catch {
      throw new ResumeParsingError(
        "MALFORMED_RESPONSE",
        "The resume service returned an invalid extraction result. Please try again.",
        "server",
      );
    }
  } catch (error) {
    if (error instanceof ResumeParsingError) throw error;
    if (error instanceof TalentMatchHttpError) {
      throw new ResumeParsingError(error.code ?? "UNKNOWN_ERROR", error.message, "server");
    }
    if (error instanceof Error && /authentication is not configured|public key/i.test(error.message)) {
      throw new ResumeParsingError("AUTH_CONFIGURATION", error.message, "client");
    }
    if (error instanceof Error && /session is required|start Talent Match session/i.test(error.message)) {
      throw new ResumeParsingError("AUTH_REQUIRED", error.message, "client");
    }
    throw new ResumeParsingError(
      "NETWORK_ERROR",
      "Could not connect to the resume parsing service. Please try again.",
      "client",
    );
  }
}
