import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "@tanstack/react-router";

const { ensureSession, getSession, anonymousAllowed } = vi.hoisted(() => ({
  ensureSession: vi.fn(),
  getSession: vi.fn(),
  anonymousAllowed: vi.fn(),
}));

vi.mock("./talentMatchSupabaseClient", () => ({
  ensureTalentMatchSession: ensureSession,
  getTalentMatchSession: getSession,
  isAnonymousDemoAllowed: anonymousAllowed,
}));

import { requireTalentMatchSession } from "./requireTalentMatchSession";

describe("requireTalentMatchSession", () => {
  beforeEach(() => {
    getSession.mockReset();
    anonymousAllowed.mockReset();
    ensureSession.mockReset();
  });

  it("redirects signed-out visitors and preserves the intended path", async () => {
    getSession.mockResolvedValue(null);

    await expect(requireTalentMatchSession("/talent-match/profile", "?tab=skills")).rejects.toMatchObject(
      redirect({
        href: "/talent-match/login?redirect=%2Ftalent-match%2Fprofile%3Ftab%3Dskills",
        replace: true,
      }),
    );
  });

  it("allows a signed-in non-anonymous user", async () => {
    const session = { user: { is_anonymous: false } };
    getSession.mockResolvedValue(session);

    await expect(requireTalentMatchSession("/talent-match")).resolves.toBe(session);
  });

  it("allows anonymous sessions only when the demo flag is enabled", async () => {
    getSession.mockResolvedValue({ user: { is_anonymous: true } });
    anonymousAllowed.mockReturnValue(false);
    await expect(requireTalentMatchSession("/talent-match")).rejects.toMatchObject({ options: { replace: true } });

    anonymousAllowed.mockReturnValue(true);
    await expect(requireTalentMatchSession("/talent-match")).resolves.toBeTruthy();
  });

  it("creates an anonymous session when the demo flag is enabled", async () => {
    const session = { user: { is_anonymous: true } };
    anonymousAllowed.mockReturnValue(true);
    getSession.mockResolvedValueOnce(null).mockResolvedValueOnce(session);

    await expect(requireTalentMatchSession("/talent-match")).resolves.toBe(session);
    expect(ensureSession).toHaveBeenCalledOnce();
  });
});
