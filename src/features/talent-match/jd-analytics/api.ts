import { talentMatchRequest, TalentMatchHttpError } from "../api/client";
import { ensureTalentMatchSession } from "../auth/talentMatchSupabaseClient";
import {
  validateJdExtractionResult,
  type JdExtractionResult,
  type SavedJobDescriptionRecord,
} from "./types";

const EXTRACTION_PATH = "/api/v1/jd-analytics/extract";
const JOB_DESCRIPTIONS_PATH = "/api/v1/job-descriptions";

function getHttpError(status: number, serverMessage: string): Error {
  if (status === 401) {
    return new Error(
      "The backend rejected this request (HTTP 401). Check the local API configuration.",
    );
  }
  if (status === 400 || status === 413 || status === 422) {
    return new Error(
      serverMessage || "The job description file could not be validated. Check it and retry.",
    );
  }
  if (status === 503) {
    return new Error(
      "JD extraction is temporarily unavailable. Check provider configuration and retry.",
    );
  }
  return new Error(serverMessage || `JD extraction failed (HTTP ${status}).`);
}

export function resolveTalentMatchApiBaseUrl(env: Record<string, string | undefined>): string {
  return env["VITE_TALENT_MATCH_API_URL"]?.trim().replace(/\/+$/, "") ?? "";
}

export async function extractJobDescription(input: File | string): Promise<JdExtractionResult> {
  const form = new FormData();
  if (typeof input === "string") {
    form.append("text", input);
  } else {
    form.append("file", input, input.name);
  }

  try {
    await ensureTalentMatchSession();
    const payload = await talentMatchRequest<unknown>(EXTRACTION_PATH, {
      method: "POST",
      body: form,
    });
    const validationErrors = validateJdExtractionResult(payload);
    if (validationErrors.length > 0) {
      throw new Error(`The extraction API returned an invalid result: ${validationErrors[0]}`);
    }
    if (
      typeof payload === "object" &&
      payload !== null &&
      "skills" in payload &&
      Array.isArray(payload.skills) &&
      payload.skills.length === 0
    ) {
      throw new Error(
        "The extraction API returned no skill requirements. Review the document and retry.",
      );
    }
    return payload as JdExtractionResult;
  } catch (caught) {
    if (caught instanceof TalentMatchHttpError) {
      throw getHttpError(caught.status, caught.message);
    }
    throw caught;
  }
}

export async function saveJobDescription(
  draft: JdExtractionResult,
): Promise<SavedJobDescriptionRecord> {
  const validationErrors = validateJdExtractionResult(draft);
  if (validationErrors.length > 0) {
    throw new Error(`The job description cannot be saved: ${validationErrors[0]}`);
  }
  if (draft.skills.length === 0) {
    throw new Error("The job description must contain at least one skill requirement.");
  }
  await ensureTalentMatchSession();
  return talentMatchRequest<SavedJobDescriptionRecord>(JOB_DESCRIPTIONS_PATH, {
    method: "POST",
    body: JSON.stringify(draft),
  });
}
