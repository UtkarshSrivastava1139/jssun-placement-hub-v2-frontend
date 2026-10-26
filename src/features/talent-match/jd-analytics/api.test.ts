import { describe, expect, it, vi } from "vitest";
import { extractJobDescription, resolveTalentMatchApiBaseUrl, saveJobDescription } from "./api";
import { TalentMatchHttpError, talentMatchRequest } from "../api/client";
import { ensureTalentMatchSession } from "../auth/talentMatchSupabaseClient";
import type { JdExtractionResult } from "./types";

vi.mock("../api/client", () => ({
  TalentMatchHttpError: class TalentMatchHttpError extends Error {
    constructor(
      message: string,
      readonly status: number,
    ) {
      super(message);
    }
  },
  talentMatchRequest: vi.fn(),
}));
vi.mock("../auth/talentMatchSupabaseClient", () => ({
  ensureTalentMatchSession: vi.fn(),
}));

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
    },
  ],
  warnings: [],
};

const file = () => new File(["pdf bytes"], "role.pdf", { type: "application/pdf" });

describe("JD Analytics API", () => {
  it("ensures a session and sends multipart input through the shared client", async () => {
    vi.mocked(talentMatchRequest).mockResolvedValue(result);
    await extractJobDescription(file());

    expect(ensureTalentMatchSession).toHaveBeenCalledOnce();
    expect(talentMatchRequest).toHaveBeenCalledWith(
      "/api/v1/jd-analytics/extract",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
    const form = vi.mocked(talentMatchRequest).mock.calls[0]?.[1]?.body as FormData;
    expect(form.get("file")).toBeInstanceOf(File);
  });

  it("rejects schema-invalid and empty extraction responses", async () => {
    vi.mocked(talentMatchRequest).mockResolvedValue({ ...result, source_type: "resume" });
    await expect(extractJobDescription(file())).rejects.toThrow("source type must be jd");

    vi.mocked(talentMatchRequest).mockResolvedValue({ ...result, skills: [] });
    await expect(extractJobDescription(file())).rejects.toThrow("returned no skill requirements");
  });

  it("maps shared client HTTP errors to actionable messages", async () => {
    vi.mocked(talentMatchRequest).mockRejectedValue(
      new TalentMatchHttpError("The file contents are invalid.", 422),
    );
    await expect(extractJobDescription(file())).rejects.toThrow("The file contents are invalid.");
  });

  it("ensures a session before saving a reviewed draft", async () => {
    vi.mocked(talentMatchRequest).mockResolvedValue({ job_description_id: "saved" });
    await saveJobDescription(result);
    expect(ensureTalentMatchSession).toHaveBeenCalled();
    expect(talentMatchRequest).toHaveBeenCalledWith(
      "/api/v1/job-descriptions",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("resolves only the dedicated backend URL setting", () => {
    expect(
      resolveTalentMatchApiBaseUrl({
        VITE_TALENT_MATCH_API_URL: " http://localhost:8000/ ",
        VITE_SUPABASE_URL: "https://database.example",
      }),
    ).toBe("http://localhost:8000");
    expect(resolveTalentMatchApiBaseUrl({ VITE_SUPABASE_URL: "https://database.example" })).toBe(
      "",
    );
  });
});
