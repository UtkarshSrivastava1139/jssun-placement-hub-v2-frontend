import { ExternalLink, PlayCircle, Star } from "lucide-react";
import { isNullish, splitItems } from "@/lib/companyData";
import type { FieldType } from "@/data/intelligenceData";

const isUrl = (v: string) => /^https?:\/\//i.test(v);

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-atlas-divider bg-atlas-page px-2 py-0.5 text-xs text-atlas-ink">
      {children}
    </span>
  );
}

export function NotAvailable() {
  return <span className="italic text-atlas-text-secondary">Not publicly available</span>;
}

export function FieldValue({ value, type }: { value?: string | undefined; type: FieldType }) {
  if (value === undefined || isNullish(value)) return <NotAvailable />;
  const v = value.trim();

  if (type === "video" || (type === "auto" && /youtube\.com|youtu\.be|vimeo\.com/i.test(v))) {
    return (
      <a
        href={v}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-atlas-focus hover:underline"
      >
        <PlayCircle className="size-4" /> Watch video
      </a>
    );
  }
  if (type === "url" || (type === "auto" && isUrl(v))) {
    return (
      <a
        href={v}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 break-all text-atlas-focus hover:underline"
      >
        {v.replace(/^https?:\/\/(www\.)?/, "")} <ExternalLink className="size-3.5 shrink-0" />
      </a>
    );
  }
  if (type === "auto" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return (
      <a href={`mailto:${v}`} className="text-atlas-focus hover:underline">
        {v}
      </a>
    );
  }
  const rating = v.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+)$/);
  if (type === "rating" || rating) {
    if (!rating) return <span>{v}</span>;
    const n = parseFloat(rating[1] ?? "0");
    const max = parseInt(rating[2] ?? "5", 10);
    return (
      <span className="inline-flex items-center gap-2">
        <span className="flex">
          {Array.from({ length: max }).map((_, i) => (
            <Star
              key={i}
              className={
                i < Math.round(n) ? "size-4 fill-regular text-regular" : "size-4 text-atlas-divider"
              }
            />
          ))}
        </span>
        <span className="font-medium">{v}</span>
      </span>
    );
  }
  if (type === "paragraph")
    return <p className="text-[15px] leading-relaxed text-atlas-ink">{v}</p>;
  if (type === "list" || v.includes(";")) {
    const items = splitItems(v);
    if (items.length > 1)
      return (
        <div className="flex flex-wrap gap-1.5">
          {items.map((i) => (
            <Pill key={i}>{i}</Pill>
          ))}
        </div>
      );
  }
  if (type === "auto" && v.length < 140 && v.split(",").length >= 3 && !/\d,\d/.test(v)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {v.split(",").map((i) => (
          <Pill key={i}>{i.trim()}</Pill>
        ))}
      </div>
    );
  }
  return <span>{v}</span>;
}
