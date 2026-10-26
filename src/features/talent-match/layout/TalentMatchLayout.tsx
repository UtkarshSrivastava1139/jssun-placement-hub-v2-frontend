import { Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { AtlasFooter } from "@/components/AtlasFooter";
import { AtlasHeader } from "@/components/AtlasHeader";
import { cn } from "@/lib/utils";
import { getTalentMatchSupabaseClient } from "../auth/talentMatchSupabaseClient";

const SECTION_ITEMS = [
  { label: "Home", to: "/talent-match" },
  { label: "Resume", to: "/talent-match/resume-parsing" },
  { label: "Profile", to: "/talent-match/profile" },
  { label: "JD", to: "/talent-match/jd-analytics" },
  { label: "Talent Check", to: "/talent-match/talent-check" },
  { label: "Skill Match", to: "/talent-match/skill-matching" },
] as const;

const PAGE_COPY: Record<string, { title: string; subtitle: string }> = {
  "/talent-match": {
    title: "Talent Match",
    subtitle: "Build your candidate profile and understand your fit for the roles you want.",
  },
  "/talent-match/resume-parsing": {
    title: "Resume",
    subtitle: "Turn your resume into an editable, evidence-backed starting point.",
  },
  "/talent-match/profile": {
    title: "Profile",
    subtitle: "Keep your candidate profile and self-assessments ready for each comparison.",
  },
  "/talent-match/jd-analytics": {
    title: "Job description",
    subtitle: "Review the skills and requirements extracted from a specific opportunity.",
  },
  "/talent-match/talent-check": {
    title: "Talent Check",
    subtitle: "See how your assessed skills compare with a target company's expectations.",
  },
  "/talent-match/skill-matching": {
    title: "Skill Match",
    subtitle: "Compare your saved profile with one job description and see the gaps.",
  },
};

function isActiveSection(pathname: string, destination: string) {
  return destination === "/talent-match"
    ? pathname === destination
    : pathname === destination || pathname.startsWith(`${destination}/`);
}

export function TalentMatchLayout() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const copy = PAGE_COPY[pathname] ?? PAGE_COPY["/talent-match"]!;

  useEffect(() => {
    let supabase;
    try {
      supabase = getTalentMatchSupabaseClient();
    } catch {
      return;
    }
    void supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await getTalentMatchSupabaseClient().auth.signOut();
    await router.navigate({ to: "/talent-match/login", replace: true });
  }

  return (
    <div className="atlas-page flex min-h-screen flex-col justify-between bg-atlas-page text-atlas-ink">
      <div>
        <AtlasHeader
          trailing={
            <div className="flex items-center gap-2">
              <Link
                to="/company/intelligence"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-atlas-text-secondary transition-colors hover:bg-atlas-page hover:text-atlas-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus sm:inline-flex"
              >
                Company intelligence
              </Link>
              <div className="inline-flex items-center gap-2 rounded-md border border-atlas-divider bg-atlas-page/60 px-3 py-2 text-xs font-medium text-atlas-text-secondary">
                <UserRound className="size-4 text-atlas-terracotta" aria-hidden />
                <span>{email ?? "Demo session"}</span>
                <button type="button" onClick={() => void signOut()} aria-label="Sign out"
                  className="rounded p-1 hover:bg-atlas-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus">
                  <LogOut className="size-3.5" aria-hidden />
                </button>
              </div>
            </div>
          }
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-atlas-terracotta">
              Talent Match
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-atlas-ink">{copy.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-atlas-text-secondary">{copy.subtitle}</p>
          </header>

          <nav
            aria-label="Talent Match sections"
            className="mb-8 overflow-x-auto border-b border-atlas-divider"
          >
            <div className="flex min-w-max gap-1">
              {SECTION_ITEMS.map((item) => {
                const active = isActiveSection(pathname, item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                      active
                        ? "border-atlas-terracotta text-atlas-ink"
                        : "border-transparent text-atlas-text-secondary hover:border-atlas-divider hover:text-atlas-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <Outlet />
        </main>
      </div>
      <AtlasFooter />
    </div>
  );
}

export { SECTION_ITEMS, isActiveSection };
