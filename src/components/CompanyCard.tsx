import { memo } from "react";
import { ArrowRight, MapPin, TrendingDown, TrendingUp, Users } from "lucide-react";
import { CompanyLogo } from "./CompanyLogo";
import { TierBadge } from "./TierBadge";
import { isNullish, type CompanySummary, type CompanyTier } from "@/lib/companyData";
import { cn } from "@/lib/utils";

function Val({ v }: { v: string }) {
  return isNullish(v) ? (
    <span className="italic font-normal text-atlas-text-secondary/75">Not publicly available</span>
  ) : (
    <span>{v}</span>
  );
}

const TIER_BORDER_COLORS: Record<CompanyTier, string> = {
  "Super Dream": "bg-super-dream",
  Dream: "bg-dream",
  Standard: "bg-standard",
  Regular: "bg-regular",
};

export const CompanyCard = memo(function CompanyCard({
  company,
  onSelect,
}: {
  company: CompanySummary;
  onSelect: (c: CompanySummary) => void;
}) {
  const negative = company.yoyGrowth.trim().startsWith("-");
  const Trend = negative ? TrendingDown : TrendingUp;

  return (
    <button
      type="button"
      onClick={() => onSelect(company)}
      aria-label={`View ${company.name} research profile`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-atlas-divider bg-atlas-surface text-left transition-all duration-200 hover:-translate-y-1 hover:border-atlas-ink/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus focus-visible:ring-offset-2"
    >
      {/* Top Tier Color Hairline Accent Stripe */}
      <div className={cn("h-[3px] w-full shrink-0", TIER_BORDER_COLORS[company.companyType])} />

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Top: Large Branded Logo Tile & Category / Tier Badges */}
          <div className="flex items-start justify-between gap-3">
            {/* 48px-tall (h-12) branded logo tile */}
            <CompanyLogo
              name={company.name}
              logoUrl={company.logoUrl}
              websiteUrl={company.websiteUrl}
              className="h-12 w-28 sm:w-32 shrink-0 rounded-lg border border-atlas-divider bg-atlas-surface p-1.5 shadow-2xs"
            />
            <div className="flex flex-col items-end gap-1.5">
              <TierBadge tier={company.companyType} />
              {company.category && !isNullish(company.category) && (
                <span
                  className="max-w-[130px] truncate rounded border border-atlas-divider bg-atlas-page px-1.5 py-0.5 text-[10px] font-medium text-atlas-text-secondary"
                  title={company.category}
                >
                  {company.category}
                </span>
              )}
            </div>
          </div>

          {/* Company Identity */}
          <div className="mt-3.5">
            <h3 className="font-heading text-base font-semibold leading-snug text-atlas-ink transition-colors group-hover:text-atlas-focus line-clamp-1">
              {company.name}
            </h3>
            {company.shortName && company.shortName !== company.name ? (
              <p className="mt-0.5 text-xs font-medium text-atlas-text-secondary line-clamp-1">
                {company.shortName}
              </p>
            ) : null}
          </div>

          {/* Structured Research Data Tiles (Pure Lucide icons, no emojis) */}
          <div className="mt-4 rounded-lg border border-atlas-divider/80 bg-atlas-page/40 p-2.5">
            <div className="grid grid-cols-2 gap-2 border-b border-atlas-divider/60 pb-2">
              <div className="min-w-0">
                <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-atlas-text-secondary">
                  <MapPin className="size-3 shrink-0 text-atlas-text-secondary" />
                  HQ
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium text-atlas-ink">
                  <Val v={company.headquarters} />
                </span>
              </div>
              <div className="min-w-0">
                <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-atlas-text-secondary">
                  <Users className="size-3 shrink-0 text-atlas-text-secondary" />
                  Size
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium text-atlas-ink">
                  <Val v={company.employeeSize} />
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-atlas-text-secondary">
                YoY Trend
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold",
                  negative
                    ? "bg-atlas-danger/10 text-atlas-danger"
                    : "bg-atlas-success/10 text-atlas-success",
                )}
              >
                <Trend className="size-3 shrink-0" />
                <Val v={company.yoyGrowth} />
                <span className="text-[10px] opacity-75">YoY</span>
              </span>
            </div>
          </div>
        </div>

        {/* Interaction cue */}
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-atlas-divider pt-2.5 text-xs font-medium text-atlas-text-secondary transition-colors group-hover:text-atlas-ink">
          <span>View research profile</span>
          <ArrowRight className="size-3.5 text-atlas-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-atlas-focus" />
        </div>
      </div>
    </button>
  );
});

export const CompanyListRow = memo(function CompanyListRow({
  company,
  onSelect,
}: {
  company: CompanySummary;
  onSelect: (c: CompanySummary) => void;
}) {
  const negative = company.yoyGrowth.trim().startsWith("-");
  const Trend = negative ? TrendingDown : TrendingUp;

  return (
    <button
      type="button"
      onClick={() => onSelect(company)}
      aria-label={`View ${company.name} research profile`}
      className="group w-full text-left transition-colors duration-150 border-b border-atlas-divider last:border-b-0 bg-atlas-surface hover:bg-atlas-page/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus focus-visible:ring-inset"
    >
      {/* Desktop Column Layout (>= 768px) */}
      <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-4 md:px-5 md:py-3.5">
        {/* Col 1-4: Identity */}
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <CompanyLogo
            name={company.name}
            logoUrl={company.logoUrl}
            websiteUrl={company.websiteUrl}
            className="h-8 w-14 shrink-0 rounded border border-atlas-divider bg-atlas-surface p-1"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-sm font-semibold leading-snug text-atlas-ink group-hover:text-atlas-focus transition-colors truncate">
              {company.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {company.shortName && company.shortName !== company.name && (
                <span className="text-[11px] text-atlas-text-secondary truncate">
                  {company.shortName}
                </span>
              )}
              {company.category && !isNullish(company.category) && (
                <span className="text-[10px] text-atlas-text-secondary bg-atlas-page px-1 py-0.2 rounded border border-atlas-divider/70 truncate">
                  {company.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Col 5-6: Placement Tier */}
        <div className="col-span-2 flex items-center">
          <TierBadge tier={company.companyType} />
        </div>

        {/* Col 7-8: Headquarters */}
        <div className="col-span-2 flex items-center gap-1.5 text-xs text-atlas-ink/90 min-w-0">
          <MapPin className="size-3.5 shrink-0 text-atlas-text-secondary" />
          <span className="truncate">
            <Val v={company.headquarters} />
          </span>
        </div>

        {/* Col 9-10: Employee Size */}
        <div className="col-span-2 flex items-center gap-1.5 text-xs text-atlas-ink/90 min-w-0">
          <Users className="size-3.5 shrink-0 text-atlas-text-secondary" />
          <span className="truncate">
            <Val v={company.employeeSize} />
          </span>
        </div>

        {/* Col 11: YoY Growth */}
        <div className="col-span-1 flex items-center gap-1 text-xs min-w-0">
          <Trend
            className={cn(
              "size-3.5 shrink-0",
              negative ? "text-atlas-danger" : "text-atlas-success",
            )}
          />
          <span
            className={cn(
              "font-medium truncate",
              negative ? "text-atlas-danger" : "text-atlas-ink",
            )}
          >
            <Val v={company.yoyGrowth} />
          </span>
        </div>

        {/* Col 12: Action indicator */}
        <div className="col-span-1 flex items-center justify-end text-atlas-text-secondary group-hover:text-atlas-focus">
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Mobile Stacked Layout (< 768px) */}
      <div className="block md:hidden px-4 py-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <CompanyLogo
              name={company.name}
              logoUrl={company.logoUrl}
              websiteUrl={company.websiteUrl}
              className="h-8 w-14 shrink-0 rounded border border-atlas-divider bg-atlas-surface p-1"
            />
            <div className="min-w-0">
              <h3 className="font-heading text-sm font-semibold text-atlas-ink truncate group-hover:text-atlas-focus">
                {company.name}
              </h3>
              {company.shortName && company.shortName !== company.name && (
                <p className="text-[11px] text-atlas-text-secondary truncate">
                  {company.shortName}
                </p>
              )}
            </div>
          </div>
          <TierBadge tier={company.companyType} />
        </div>

        {/* Sub-row with category and metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-atlas-text-secondary">
          {company.category && !isNullish(company.category) && (
            <span className="text-[10px] text-atlas-text-secondary bg-atlas-page px-1 py-0.2 rounded border border-atlas-divider">
              {company.category}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="size-3 text-atlas-text-secondary" />
            <Val v={company.headquarters} />
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3 text-atlas-text-secondary" />
            <Val v={company.employeeSize} />
          </span>
          <span className="flex items-center gap-1">
            <Trend
              className={cn("size-3", negative ? "text-atlas-danger" : "text-atlas-success")}
            />
            <span className={negative ? "text-atlas-danger" : "text-atlas-ink"}>
              <Val v={company.yoyGrowth} />
            </span>
            <span>YoY</span>
          </span>
        </div>
      </div>
    </button>
  );
});
