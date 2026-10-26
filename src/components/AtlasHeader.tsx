import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { COLLEGE_NAME, COLLEGE_SHORT } from "@/lib/college";
import { cn } from "@/lib/utils";
import { PlacementNavbar } from "./PlacementNavbar";

export function AtlasHeader({ trailing, className }: { trailing?: ReactNode; className?: string }) {
  return (
    <header className={cn("border-b-2 border-atlas-terracotta bg-atlas-surface", className)}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6">
        <Link
          to="/"
          className="group flex min-w-0 shrink items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus sm:gap-3"
        >
          <img
            src="/JSS%20University%20Logo.png"
            alt={`${COLLEGE_NAME} Crest`}
            className="size-8 shrink-0 object-contain rounded-md sm:size-9"
          />
          <div className="flex min-w-0 flex-col">
            <span className="hidden truncate text-[11px] font-semibold uppercase tracking-wider text-atlas-text-secondary transition-colors group-hover:text-atlas-ink sm:block">
              {COLLEGE_SHORT}
            </span>
            <span className="font-heading text-xs font-medium tracking-tight text-atlas-ink sm:text-sm">
              Placement Intelligence Hub
            </span>
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <PlacementNavbar />
        </div>
        {trailing}
      </div>
    </header>
  );
}
