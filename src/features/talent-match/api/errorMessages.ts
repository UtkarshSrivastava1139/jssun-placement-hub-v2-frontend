import { TalentMatchHttpError } from "./client";

export type FriendlyTalentMatchError = {
  title: string;
  message: string;
};

const ERROR_MESSAGES: Record<string, FriendlyTalentMatchError> = {
  auth_required: {
    title: "Sign-in required",
    message: "Please sign in to use Talent Match, then try again.",
  },
  auth_invalid: {
    title: "Session expired",
    message: "Your session is no longer valid. Please sign in again and retry.",
  },
  college_email_required: {
    title: "College email required",
    message: "Use a confirmed college email address to access Talent Match.",
  },
  storage_unavailable: {
    title: "Service temporarily unavailable",
    message: "Talent Match could not reach its storage service. Please try again shortly.",
  },
  SNAPSHOT_NOT_FOUND: {
    title: "Company data unavailable",
    message: "The company skillset data is temporarily unavailable. Please try again later.",
  },
  MALFORMED_SNAPSHOT: {
    title: "Company data unavailable",
    message: "The company skillset data could not be loaded. Please try again later.",
  },
  PROFILE_NOT_FOUND: {
    title: "Profile not found",
    message: "Create and save a candidate profile before requesting this assessment.",
  },
  INCOMPLETE_CANDIDATE_PROFILE: {
    title: "Profile needs more information",
    message: "Your candidate profile is incomplete.",
  },
  JOB_DESCRIPTION_NOT_FOUND: {
    title: "Job description unavailable",
    message: "Job description not found or access denied.",
  },
};

const UNKNOWN_ERROR: FriendlyTalentMatchError = {
  title: "Request failed",
  message: "Talent Match could not complete that request. Please try again.",
};

export function mapTalentMatchError(error: unknown): FriendlyTalentMatchError {
  if (error instanceof TalentMatchHttpError && error.code) {
    return ERROR_MESSAGES[error.code] ?? UNKNOWN_ERROR;
  }
  return UNKNOWN_ERROR;
}

export function getTalentMatchErrorMessage(error: unknown): string {
  return mapTalentMatchError(error).message;
}
