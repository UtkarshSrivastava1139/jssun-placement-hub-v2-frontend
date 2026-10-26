import { Info } from "lucide-react";

type SampleDataBannerProps = {
  detail?: string;
};

export function SampleDataBanner({ detail }: SampleDataBannerProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200"
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>
        <strong>Sample data, not your results.</strong>
        {detail ? ` ${detail}` : null}
      </span>
    </div>
  );
}
