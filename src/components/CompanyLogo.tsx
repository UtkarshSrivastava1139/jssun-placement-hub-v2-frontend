import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_DEV_KEY = import.meta.env["VITE_LOGO_DEV_PUBLISHABLE_KEY"] as string | undefined;

function domainOf(url?: string, name?: string) {
  if (url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (
        !host.includes("wikimedia") &&
        !host.includes("wikipedia") &&
        !host.includes("twimg") &&
        !host.includes("google") &&
        !host.includes("linktr.ee")
      ) {
        return host;
      }
    } catch {
      // ignore invalid URLs
    }
  }
  if (name) {
    const cleaned = name
      .split(/\s+/)[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    if (cleaned && cleaned.length > 2) {
      return `${cleaned}.com`;
    }
  }
  return "";
}

export function CompanyLogo({
  name,
  logoUrl,
  websiteUrl,
  className,
}: {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  className?: string;
}) {
  const sources = useMemo(() => {
    const rawUrls = (logoUrl ?? "")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http") && !s.toLowerCase().includes(".pdf"));

    const domain = domainOf(websiteUrl || rawUrls[0], name);

    return [
      ...rawUrls,
      LOGO_DEV_KEY && domain ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_KEY}&size=128` : "",
      domain ? `https://unavatar.io/${domain}?fallback=false` : "",
      domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : "",
    ].filter(Boolean);
  }, [logoUrl, websiteUrl, name]);

  const [idx, setIdx] = useState(0);
  const src = sources[idx];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-atlas-divider bg-atlas-surface",
        !className?.includes("size-") && !className?.includes("h-") && "size-12",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={`${name} logo`}
          className="max-h-full max-w-full object-contain"
          onError={() => setIdx((i) => i + 1)}
          loading="lazy"
        />
      ) : (
        <span className="font-heading text-lg font-bold text-atlas-ink">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
