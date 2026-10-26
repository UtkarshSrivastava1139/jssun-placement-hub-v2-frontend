import { describe, expect, it } from "vitest";
import { resolveDatabaseConfig } from "./databaseConfig";

describe("local database isolation", () => {
  it("uses local database settings rather than downloaded Cloud settings", () => {
    expect(
      resolveDatabaseConfig({
        VITE_PORTAL_DATABASE_URL: "https://local.example",
        VITE_PORTAL_DATABASE_KEY: "public-local",
        VITE_SUPABASE_URL: "https://cloud.example",
        VITE_SUPABASE_ANON_KEY: "public-cloud",
      }),
    ).toEqual({ url: "https://local.example", key: "public-local" });
  });
  it("never silently uses Cloud when local setup is incomplete", () => {
    expect(
      resolveDatabaseConfig({
        VITE_PORTAL_DATABASE_URL: "",
        VITE_PORTAL_DATABASE_KEY: "",
        VITE_SUPABASE_URL: "https://cloud.example",
        VITE_SUPABASE_ANON_KEY: "public-cloud",
      }),
    ).toEqual({ url: "", key: "" });
  });
});
