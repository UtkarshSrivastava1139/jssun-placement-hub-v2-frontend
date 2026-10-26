import { COLLEGE_NAME } from "@/lib/college";
import { cn } from "@/lib/utils";

export function AtlasFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-16 border-t border-atlas-divider bg-atlas-surface", className)}>
      <div className="h-[2px] w-full bg-atlas-terracotta" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <img
              src="/JSS%20University%20Logo.png"
              alt={`${COLLEGE_NAME} Crest`}
              className="size-11 shrink-0 object-contain"
            />
            <div>
              <p className="font-heading text-sm font-semibold text-atlas-ink">{COLLEGE_NAME}</p>
              <p className="text-xs text-atlas-text-secondary">
                Training &amp; Placement Centre · JSS Mahavidyapeetha
              </p>
              <p className="text-[11px] text-atlas-text-secondary">
                C-20/1, Sector 62, Noida, Uttar Pradesh 201301
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-mono text-xs font-medium text-atlas-ink">
              Placement Intelligence Hub
            </p>
            <p className="text-xs text-atlas-text-secondary">
              Confidential student placement preparation &amp; research portal
            </p>
            <p className="mt-1 text-[11px] text-atlas-text-secondary/75">
              &copy; {new Date().getFullYear()} {COLLEGE_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
