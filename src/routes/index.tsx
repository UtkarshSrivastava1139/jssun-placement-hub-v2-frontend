import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X, SearchX, LayoutGrid, List as ListIcon } from "lucide-react";
import { useCompanies } from "@/lib/companyApi";
import { TIERS, type CompanySummary, type CompanyTier } from "@/lib/companyData";
import { CompanyCard, CompanyListRow } from "@/components/CompanyCard";
import { TIER_STYLES } from "@/components/TierBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AtlasFooter } from "@/components/AtlasFooter";
import { AtlasHeader } from "@/components/AtlasHeader";
import { useCompany } from "@/context/CompanyContext";
import { COLLEGE_NAME, COLLEGE_SHORT } from "@/lib/college";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${COLLEGE_SHORT} Placement Intelligence Hub — Companies Research Portal` },
      {
        name: "description",
        content: `Research recruiting companies and prepare for campus placements at ${COLLEGE_NAME}.`,
      },
      { property: "og:title", content: `${COLLEGE_SHORT} Placement Intelligence Hub` },
      { property: "og:description", content: "Your strategic edge for campus placements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Filter = "All" | CompanyTier;
type ViewMode = "grid" | "list";

const ALPHABET = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "#"];

function Index() {
  const navigate = useNavigate();
  const { selectCompany } = useCompany();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  // Grid is always default on fresh visit/reload (never persisted)
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { data: companies = [], isLoading: loading, isError, error, refetch } = useCompanies();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const searched = useMemo(
    () =>
      companies.filter(
        (c) =>
          !debounced || `${c.name} ${c.shortName} ${c.category}`.toLowerCase().includes(debounced),
      ),
    [companies, debounced],
  );

  const counts = useMemo(() => {
    const m: Record<Filter, number> = {
      All: searched.length,
      "Super Dream": 0,
      Dream: 0,
      Standard: 0,
      Regular: 0,
    };
    searched.forEach((c) => m[c.companyType]++);
    return m;
  }, [searched]);

  const visible = filter === "All" ? searched : searched.filter((c) => c.companyType === filter);

  // Sort companies alphabetically A-Z
  const sortedVisible = useMemo(() => {
    return [...visible].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }),
    );
  }, [visible]);

  // Group sorted companies by first character (A-Z, #)
  const grouped = useMemo(() => {
    const map = new Map<string, CompanySummary[]>();
    for (const c of sortedVisible) {
      const first = (c.name.trim()[0] ?? "").toUpperCase();
      const letter = /^[A-Z]$/.test(first) ? first : "#";
      const list = map.get(letter);
      if (list) {
        list.push(c);
      } else {
        map.set(letter, [c]);
      }
    }
    const keys = Array.from(map.keys()).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });
    return keys.map((letter) => ({ letter, companies: map.get(letter)! }));
  }, [sortedVisible]);

  const activeLetters = useMemo(() => new Set(grouped.map((g) => g.letter)), [grouped]);

  const scrollToLetter = useCallback((letter: string) => {
    const el = document.getElementById(`section-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const onSelect = useCallback(
    (c: CompanySummary) => {
      selectCompany({ companyId: c.id, companyName: c.name, logoUrl: c.logoUrl });
      navigate({ to: "/company/intelligence" });
    },
    [navigate, selectCompany],
  );

  const reset = () => {
    setQuery("");
    setDebounced("");
    setFilter("All");
  };

  return (
    <div className="atlas-page min-h-screen bg-atlas-page text-atlas-ink">
      <AtlasHeader
        trailing={
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/talent-match/jd-analytics"
              className="rounded-md border border-atlas-divider bg-atlas-surface px-3 py-2 text-xs font-medium text-atlas-ink transition-colors hover:bg-atlas-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus sm:text-sm"
            >
              JD Analytics
            </Link>
            <div className="hidden items-center gap-2 rounded border border-atlas-divider bg-atlas-page px-2.5 py-1 font-mono text-[11px] text-atlas-text-secondary sm:flex">
              <span className="size-1.5 rounded-full bg-atlas-success" />
              <span>
                {loading ? "Loading directory…" : `${companies.length} Organizations Indexed`}
              </span>
            </div>
          </div>
        }
      />

      {/* Editorial Page Introduction */}
      <section className="border-b border-atlas-divider bg-atlas-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-atlas-divider bg-atlas-page px-3 py-1 text-xs font-semibold uppercase tracking-wider text-atlas-text-secondary">
                <img
                  src="/JSS%20University%20Logo.png"
                  alt={`${COLLEGE_NAME} Crest`}
                  className="size-4 shrink-0 object-contain"
                />
                <span>Institutional Placement Intelligence · JSS Mahavidyapeetha</span>
              </div>
              <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-atlas-ink sm:text-3xl lg:text-4xl leading-tight">
                {COLLEGE_NAME} Companies Research &amp; Placement Analytics Portal
              </h1>
              <p className="mt-2 text-sm text-atlas-text-secondary sm:text-base font-normal">
                Your strategic edge for campus placements · Comprehensive company dossiers, skill
                roadmaps, and recruiting analytics for graduating engineers.
              </p>

              {/* Integrated Search Bar */}
              <div className="relative mt-6 max-w-xl">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-atlas-text-secondary" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search companies by name or category"
                  aria-label="Search companies by name or category"
                  className="h-11 w-full rounded-md border border-atlas-divider bg-atlas-surface pl-10 pr-10 text-sm text-atlas-ink outline-none transition-colors placeholder:text-atlas-text-secondary focus:border-atlas-focus focus:ring-1 focus:ring-atlas-focus"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-atlas-text-secondary hover:bg-atlas-page hover:text-atlas-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Framed Campus Architecture Card */}
            <div className="hidden lg:flex lg:w-96 xl:w-[420px] shrink-0 flex-col">
              <div className="group relative overflow-hidden rounded-xl border border-atlas-divider bg-atlas-page shadow-2xs transition-all duration-300 hover:shadow-md hover:border-atlas-ink/30">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-atlas-surface">
                  <img
                    src="/NEW%20JSS%20UNI%20IMAGES%203.jpg"
                    alt="JSS University Noida Campus"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between text-white">
                    <div className="min-w-0">
                      <p className="truncate font-heading text-xs font-semibold drop-shadow-sm">
                        JSS University Campus, Noida
                      </p>
                      <p className="truncate text-[10px] text-white/85 drop-shadow-sm">
                        Sector 62, Noida, Uttar Pradesh
                      </p>
                    </div>
                    <span className="shrink-0 rounded bg-white/20 px-2 py-0.5 font-mono text-[10px] font-medium backdrop-blur-md">
                      Placement Cell
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory & Controls Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Placement Category Filters Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-atlas-divider pb-4">
          <div className="-mx-4 flex max-w-full items-center gap-1 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
            <div className="inline-flex items-center gap-1 rounded-lg border border-atlas-divider bg-atlas-surface sm:bg-atlas-page/80 p-1">
              {(["All", ...TIERS] as Filter[]).map((f) => {
                const active = filter === f;
                const s = f === "All" ? null : TIER_STYLES[f];
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                      active
                        ? "border border-atlas-divider bg-atlas-surface text-atlas-ink font-semibold shadow-2xs"
                        : "text-atlas-text-secondary hover:bg-atlas-surface/70 hover:text-atlas-ink",
                    )}
                  >
                    {s && <span className={cn("size-2 rounded-full shrink-0", s.dot)} />}
                    <span>{f}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.2 font-mono text-[10px] tabular-nums",
                        active
                          ? "bg-atlas-selected text-atlas-ink"
                          : "bg-atlas-divider/60 text-atlas-text-secondary",
                      )}
                    >
                      {counts[f]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directory Results Counter */}
          <div className="font-mono text-xs text-atlas-text-secondary">
            {!loading && !isError && (
              <span>
                {visible.length === companies.length
                  ? `${companies.length} recruiting organizations`
                  : `Showing ${visible.length} of ${companies.length} organizations`}
              </span>
            )}
          </div>
        </div>

        {/* Directory View Bar: Subheading & Grid/List Toggle */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-semibold tracking-tight text-atlas-ink sm:text-lg">
              Directory Index
            </h2>
            {!loading && !isError && (
              <span className="font-mono text-xs text-atlas-text-secondary">
                ({visible.length} {visible.length === 1 ? "result" : "results"})
              </span>
            )}
          </div>

          {/* Grid / List Switcher */}
          <div
            role="group"
            aria-label="Directory presentation view"
            className="inline-flex items-center rounded-lg border border-atlas-divider bg-atlas-surface p-0.5 shadow-2xs"
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                viewMode === "grid"
                  ? "bg-atlas-ink text-white shadow-2xs font-semibold"
                  : "text-atlas-text-secondary hover:text-atlas-ink hover:bg-atlas-page",
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                viewMode === "list"
                  ? "bg-atlas-ink text-white shadow-2xs font-semibold"
                  : "text-atlas-text-secondary hover:text-atlas-ink hover:bg-atlas-page",
              )}
            >
              <ListIcon className="size-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* A–Z Alphabetical Jump Ribbon */}
        {!loading && !isError && sortedVisible.length > 0 && (
          <nav
            aria-label="Alphabetical jump index"
            className="mb-6 -mx-4 flex items-center overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0"
          >
            <div className="inline-flex min-w-max items-center gap-1 rounded-lg border border-atlas-divider bg-atlas-surface p-1 shadow-2xs">
              <span className="hidden px-2 text-[10px] font-bold uppercase tracking-wider text-atlas-text-secondary md:inline">
                A–Z Index
              </span>
              <div className="flex items-center gap-0.5">
                {ALPHABET.map((letter) => {
                  const has = activeLetters.has(letter);
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={!has}
                      onClick={() => scrollToLetter(letter)}
                      aria-label={
                        has ? `Jump to section ${letter}` : `No companies starting with ${letter}`
                      }
                      className={cn(
                        "flex h-7 min-w-7 items-center justify-center rounded text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                        has
                          ? "text-atlas-ink hover:bg-atlas-page hover:text-atlas-focus active:scale-95 cursor-pointer"
                          : "text-atlas-text-secondary/25 cursor-not-allowed select-none",
                      )}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        )}

        {/* Directory Presentation / Skeletons / States */}
        {loading ? (
          viewMode === "grid" ? (
            /* Grid Skeleton */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-72 flex-col justify-between overflow-hidden rounded-xl border border-atlas-divider bg-atlas-surface"
                >
                  <Skeleton className="h-[3px] w-full rounded-none" />
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-12 w-28 sm:w-32 rounded-lg" />
                        <Skeleton className="h-5 w-20 rounded" />
                      </div>
                      <div className="mt-3.5 space-y-1.5">
                        <Skeleton className="h-5 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                      <div className="mt-4 rounded-lg border border-atlas-divider/60 bg-atlas-page/40 p-2.5">
                        <div className="grid grid-cols-2 gap-2 border-b border-atlas-divider/50 pb-2">
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-10 rounded" />
                            <Skeleton className="h-3.5 w-20 rounded" />
                          </div>
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-10 rounded" />
                            <Skeleton className="h-3.5 w-16 rounded" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Skeleton className="h-3 w-14 rounded" />
                          <Skeleton className="h-4 w-16 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-atlas-divider pt-2.5">
                      <Skeleton className="h-3 w-28 rounded" />
                      <Skeleton className="size-3.5 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List Skeleton */
            <div className="overflow-hidden rounded-lg border border-atlas-divider bg-atlas-surface shadow-2xs">
              <div className="hidden md:grid md:grid-cols-12 md:gap-4 border-b border-atlas-divider bg-atlas-page px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-atlas-text-secondary">
                <div className="col-span-4">Company</div>
                <div className="col-span-2">Placement Tier</div>
                <div className="col-span-2">Headquarters</div>
                <div className="col-span-2">Employee Size</div>
                <div className="col-span-1">YoY Growth</div>
                <div className="col-span-1 text-right">Profile</div>
              </div>
              <div className="divide-y divide-atlas-divider">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5">
                    <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-4">
                      <div className="col-span-4 flex items-center gap-3">
                        <Skeleton className="size-9 rounded shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Skeleton className="h-5 w-20 rounded" />
                      </div>
                      <div className="col-span-2">
                        <Skeleton className="h-3.5 w-28 rounded" />
                      </div>
                      <div className="col-span-2">
                        <Skeleton className="h-3.5 w-20 rounded" />
                      </div>
                      <div className="col-span-1">
                        <Skeleton className="h-3.5 w-12 rounded" />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Skeleton className="size-4 rounded" />
                      </div>
                    </div>
                    {/* Mobile skeleton */}
                    <div className="space-y-2 md:hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="size-8 rounded" />
                          <Skeleton className="h-4 w-32 rounded" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                      <div className="flex gap-4">
                        <Skeleton className="h-3 w-20 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : isError ? (
          <div
            role="alert"
            className="mx-auto my-12 max-w-lg rounded-lg border border-atlas-divider bg-atlas-surface p-8 text-center shadow-2xs"
          >
            <p className="text-sm font-medium text-atlas-danger">{error.message}</p>
            <p className="mt-1 text-xs text-atlas-text-secondary">
              Please check your database connectivity and retry.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-atlas-divider text-atlas-ink hover:bg-atlas-page"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        ) : sortedVisible.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-atlas-divider bg-atlas-surface/70 px-4 py-16 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-atlas-page text-atlas-text-secondary">
              <SearchX className="size-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-atlas-ink">
              No companies match your search
            </p>
            <p className="mt-1 text-xs text-atlas-text-secondary">
              Try a different name or category, or reset your active filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-atlas-divider text-atlas-ink hover:bg-atlas-page"
              onClick={reset}
            >
              Reset filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View: Grouped by alphabet, 4 cols wide desktop (>=1280px), 3 cols (1024-1279px), 2 cols (640-1023px), 1 col (<640px) */
          <div className="space-y-8">
            {grouped.map((group) => (
              <section
                key={group.letter}
                id={`section-${group.letter}`}
                className="scroll-mt-6"
                aria-labelledby={`heading-section-${group.letter}`}
              >
                {/* Letter Section Divider Header */}
                <div className="mb-4 flex items-center gap-3">
                  <span
                    id={`heading-section-${group.letter}`}
                    className="flex size-7 items-center justify-center rounded border border-atlas-divider bg-atlas-surface font-heading text-xs font-bold text-atlas-ink shadow-2xs"
                  >
                    {group.letter}
                  </span>
                  <span className="font-mono text-xs text-atlas-text-secondary">
                    {group.companies.length}{" "}
                    {group.companies.length === 1 ? "organization" : "organizations"}
                  </span>
                  <div className="h-px flex-1 bg-atlas-divider" />
                </div>

                {/* Grid Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.companies.map((c) => (
                    <CompanyCard key={c.id} company={c} onSelect={onSelect} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* List View: Grouped by alphabet with aligned columns on desktop, responsive stacked rows on mobile */
          <div className="overflow-hidden rounded-lg border border-atlas-divider bg-atlas-surface shadow-2xs">
            {/* Table column header */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-4 border-b border-atlas-divider bg-atlas-page px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-atlas-text-secondary">
              <div className="col-span-4">Company</div>
              <div className="col-span-2">Placement Tier</div>
              <div className="col-span-2">Headquarters</div>
              <div className="col-span-2">Employee Size</div>
              <div className="col-span-1">YoY Growth</div>
              <div className="col-span-1 text-right">Profile</div>
            </div>

            {/* Grouped Table Rows */}
            <div>
              {grouped.map((group) => (
                <div
                  key={group.letter}
                  id={`section-${group.letter}`}
                  className="scroll-mt-6"
                  aria-labelledby={`list-heading-section-${group.letter}`}
                >
                  {/* Letter Section Subheader */}
                  <div className="flex items-center gap-2.5 border-y border-atlas-divider bg-atlas-page/80 px-5 py-2 text-xs font-semibold text-atlas-ink first:border-t-0">
                    <span
                      id={`list-heading-section-${group.letter}`}
                      className="flex size-5 items-center justify-center rounded border border-atlas-divider bg-atlas-surface font-heading text-[11px] font-bold text-atlas-ink shadow-2xs"
                    >
                      {group.letter}
                    </span>
                    <span className="font-mono text-[11px] font-normal text-atlas-text-secondary">
                      ({group.companies.length}{" "}
                      {group.companies.length === 1 ? "organization" : "organizations"})
                    </span>
                    <div className="h-px flex-1 bg-atlas-divider/70" />
                  </div>

                  {/* Company Rows */}
                  <div className="divide-y divide-atlas-divider">
                    {group.companies.map((c) => (
                      <CompanyListRow key={c.id} company={c} onSelect={onSelect} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <AtlasFooter />
    </div>
  );
}
