import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/talent-match/profile";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="talent-match-page">Page content</div>,
  useRouterState: () => pathname,
  useRouter: () => ({ navigate: vi.fn() }),
}));

vi.mock("@/components/AtlasHeader", () => ({
  AtlasHeader: ({ trailing }: { trailing?: React.ReactNode }) => <header>{trailing}</header>,
}));

vi.mock("@/components/AtlasFooter", () => ({
  AtlasFooter: () => <footer>Footer</footer>,
}));

import { TalentMatchLayout } from "./TalentMatchLayout";

describe("TalentMatchLayout", () => {
  beforeEach(() => {
    pathname = "/talent-match/profile";
  });

  it.each([
    ["/talent-match/profile", "Profile"],
    ["/talent-match/resume-parsing", "Resume"],
    ["/talent-match/jd-analytics", "JD"],
    ["/talent-match/talent-check", "Talent Check"],
    ["/talent-match/skill-matching", "Skill Match"],
  ])("renders %s inside the shared layout and highlights %s", (path, label) => {
    pathname = path;
    render(<TalentMatchLayout />);

    expect(screen.getByTestId("talent-match-page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: label === "JD" ? "Job description" : label })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Demo session")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Company intelligence" })).toHaveAttribute(
      "href",
      "/company/intelligence",
    );
  });
});
