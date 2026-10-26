import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, GraduationCap, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Research dossier", url: "/company/intelligence", icon: BookOpen },
  { title: "Skill ladder", url: "/company/skills", icon: GraduationCap },
] as const;

export function CompanyAtlasNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <nav
      aria-label="Company research views"
      className="border-b border-atlas-divider bg-atlas-surface"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <div
          role="tablist"
          aria-label="Dossier or skill ladder"
          className="inline-flex min-w-0 items-center rounded-lg border border-atlas-divider bg-atlas-page/80 p-0.5"
        >
          {items.map((item) => {
            const active = path === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                role="tab"
                aria-selected={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus sm:px-3",
                  active
                    ? "bg-atlas-ink font-semibold text-white shadow-2xs"
                    : "text-atlas-text-secondary hover:bg-atlas-surface hover:text-atlas-ink",
                )}
              >
                <item.icon className="size-3.5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-atlas-text-secondary transition-colors hover:bg-atlas-page hover:text-atlas-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus"
        >
          <LayoutGrid className="size-3.5" />
          <span className="hidden sm:inline">All companies</span>
          <span className="sm:hidden">All</span>
        </Link>
      </div>
    </nav>
  );
}
