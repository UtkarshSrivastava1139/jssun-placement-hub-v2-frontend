import { Globe, Linkedin } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { TierBadge } from "@/components/TierBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { isNullish } from "@/lib/companyData";
import { useCompanyProfile } from "@/lib/companyApi";

export function CompanyIdentityStrip({
  companyId,
  fallbackName,
}: {
  companyId?: number;
  fallbackName?: string;
}) {
  const { data, isLoading } = useCompanyProfile(companyId);
  const summary = data?.summary;
  const profile = data?.profile;
  const name = summary?.name ?? fallbackName ?? "…";
  const website = profile?.["website_url"];
  const linkedin = profile?.["linkedin_url"];

  if (isLoading && !data) {
    return (
      <div className="border-b border-atlas-divider bg-atlas-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Skeleton className="size-12 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-48 max-w-full rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-atlas-divider bg-atlas-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <CompanyLogo
          name={name}
          logoUrl={summary?.logoUrl}
          websiteUrl={summary?.websiteUrl}
          className="size-12"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-lg font-semibold leading-tight text-atlas-ink">
            {name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {summary ? <TierBadge tier={summary.companyType} /> : null}
            {summary?.category && !isNullish(summary.category) ? (
              <span className="inline-flex max-w-[180px] truncate rounded border border-atlas-divider bg-atlas-page px-2 py-0.5 text-[11px] font-medium text-atlas-text-secondary">
                {summary.category}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {website && !isNullish(website) ? (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-atlas-divider px-2.5 py-1.5 text-xs font-medium text-atlas-ink hover:bg-atlas-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus"
            >
              <Globe className="size-3.5" />
              <span className="hidden sm:inline">Website</span>
            </a>
          ) : null}
          {linkedin && !isNullish(linkedin) ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-atlas-divider px-2.5 py-1.5 text-xs font-medium text-atlas-ink hover:bg-atlas-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus"
            >
              <Linkedin className="size-3.5" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
