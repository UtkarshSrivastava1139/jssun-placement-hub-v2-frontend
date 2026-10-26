import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BriefcaseBusiness, Compass, Menu, Sparkles, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Company Intelligence",
    shortLabel: "Companies",
    description: "Research and hiring signals",
    to: "/company/intelligence",
    icon: BriefcaseBusiness,
  },
  {
    label: "Talent Match",
    shortLabel: "Talent Match",
    description: "Build your candidate profile",
    to: "/talent-match/profile",
    icon: Sparkles,
  },
  {
    label: "Talent Check",
    shortLabel: "Talent Check",
    description: "Company readiness assessment",
    to: "/talent-match/talent-check",
    icon: Compass,
  },
  {
    label: "Skill Matching",
    shortLabel: "Skill Matching",
    description: "Match your profile to a saved JD",
    to: "/talent-match/skill-matching",
    icon: Target,
  },
] as const;

function isActivePath(pathname: string, destination: (typeof NAV_ITEMS)[number]["to"]) {
  if (destination === "/company/intelligence") {
    return pathname === "/" || pathname.startsWith("/company");
  }
  return pathname === destination || pathname.startsWith(`${destination}/`);
}

export function PlacementNavbar() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav aria-label="Primary navigation" className="relative flex min-w-0 items-center">
      <div className="hidden items-center rounded-xl border border-atlas-divider bg-atlas-page/70 p-1 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-w-40 items-center gap-2 rounded-lg px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                active
                  ? "bg-atlas-surface text-atlas-ink shadow-sm ring-1 ring-atlas-divider"
                  : "text-atlas-text-secondary hover:text-atlas-ink",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active
                    ? "text-atlas-terracotta"
                    : "text-atlas-text-secondary group-hover:text-atlas-ink",
                )}
                aria-hidden
              />
              <span className="flex flex-col text-left">
                <span className="text-xs font-semibold leading-4">{item.label}</span>
                <span className="text-[10px] leading-3 text-atlas-text-secondary">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="md:hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="placement-primary-mobile-menu"
          aria-label={mobileOpen ? "Close primary navigation" : "Open primary navigation"}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-atlas-divider bg-atlas-page/70 text-atlas-ink transition-colors hover:bg-atlas-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>

        {mobileOpen && (
          <div
            id="placement-primary-mobile-menu"
            className="absolute right-0 top-12 z-20 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-atlas-divider bg-atlas-surface p-2 shadow-lg"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                    active
                      ? "bg-atlas-terracotta/10 text-atlas-ink"
                      : "text-atlas-text-secondary hover:bg-atlas-page hover:text-atlas-ink",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-atlas-terracotta" aria-hidden />
                  <span className="flex flex-col text-left">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-xs text-atlas-text-secondary">{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
