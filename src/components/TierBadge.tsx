import { cn } from "@/lib/utils";
import type { CompanyTier } from "@/lib/companyData";

export const TIER_STYLES: Record<
  CompanyTier,
  { text: string; bg: string; dot: string; activeBg: string; border: string }
> = {
  "Super Dream": {
    text: "text-super-dream",
    bg: "bg-super-dream/10",
    dot: "bg-super-dream",
    activeBg: "bg-super-dream",
    border: "border-super-dream/30",
  },
  Dream: {
    text: "text-dream",
    bg: "bg-dream/10",
    dot: "bg-dream",
    activeBg: "bg-dream",
    border: "border-dream/30",
  },
  Standard: {
    text: "text-standard",
    bg: "bg-standard/10",
    dot: "bg-standard",
    activeBg: "bg-standard",
    border: "border-standard/30",
  },
  Regular: {
    text: "text-regular",
    bg: "bg-regular/10",
    dot: "bg-regular",
    activeBg: "bg-regular",
    border: "border-regular/30",
  },
};

export function TierBadge({ tier, className }: { tier: CompanyTier; className?: string }) {
  const s = TIER_STYLES[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        s.bg,
        s.text,
        s.border,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", s.dot)} />
      {tier}
    </span>
  );
}
