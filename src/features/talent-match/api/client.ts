import { getTalentMatchSupabaseClient } from "../auth/talentMatchSupabaseClient";

export type ApiError = {
  error?: {
    code?: string;
    message?: string;
    details?: Array<Record<string, unknown>>;
  };
};

export class TalentMatchHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: Array<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "TalentMatchHttpError";
  }
}

export async function talentMatchRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await getTalentMatchSupabaseClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("A Talent Match session is required. Please try again.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const baseUrl =
    import.meta.env["VITE_TALENT_MATCH_API_URL"] ||
    import.meta.env["VITE_TALENT_MATCH_API_BASE_URL"] ||
    "http://localhost:8000";
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const body = (await response.json()) as T | ApiError;
  if (!response.ok) {
    const message =
      (body as ApiError).error?.message || `Talent Match request failed (${response.status}).`;
    throw new TalentMatchHttpError(
      message,
      response.status,
      (body as ApiError).error?.code,
      (body as ApiError).error?.details,
    );
  }
  return body as T;
}
