import { describe, expect, it } from "vitest";
import { TalentMatchHttpError } from "./client";
import { mapTalentMatchError } from "./errorMessages";

describe("mapTalentMatchError", () => {
  const documentedCodes = [
    "auth_required",
    "auth_invalid",
    "college_email_required",
    "storage_unavailable",
    "SNAPSHOT_NOT_FOUND",
    "MALFORMED_SNAPSHOT",
    "PROFILE_NOT_FOUND",
    "INCOMPLETE_CANDIDATE_PROFILE",
    "JOB_DESCRIPTION_NOT_FOUND",
  ];

  it.each(documentedCodes)("maps %s to a stable friendly message", (code) => {
    const result = mapTalentMatchError(
      new TalentMatchHttpError("raw server text with a stack", 500, code),
    );

    expect(result.title).toBeTruthy();
    expect(result.message).toBeTruthy();
    expect(result.message).not.toContain("raw server text");
    expect(result.message).not.toContain("stack");
  });

  it("uses a safe fallback for unknown server codes", () => {
    const result = mapTalentMatchError(
      new TalentMatchHttpError("do not show this response body", 500, "NEW_SERVER_CODE"),
    );

    expect(result).toEqual({
      title: "Request failed",
      message: "Talent Match could not complete that request. Please try again.",
    });
    expect(result.message).not.toContain("do not show");
  });

  it("uses a safe fallback for network failures without exposing the error text", () => {
    const result = mapTalentMatchError(new TypeError("fetch failed: secret internal URL"));

    expect(result.message).toBe("Talent Match could not complete that request. Please try again.");
    expect(result.message).not.toContain("secret internal URL");
  });
});
