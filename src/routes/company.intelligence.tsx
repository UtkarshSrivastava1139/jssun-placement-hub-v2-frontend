import { createFileRoute } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCompany } from "@/context/CompanyContext";
import {
  buildIntelligenceSections,
  groupSectionsByChapter,
  type IntelligenceSection,
} from "@/data/intelligenceData";
import { isNullish } from "@/lib/companyData";
import { useCompanyProfile } from "@/lib/companyApi";
import { CompanyDataState } from "@/components/CompanyDataState";
import { FieldValue } from "@/components/FieldValue";
import { COLLEGE_SHORT } from "@/lib/college";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/company/intelligence")({
  head: () => ({
    meta: [
      { title: `Company Intelligence — ${COLLEGE_SHORT} Placement Hub` },
      {
        name: "description",
        content:
          "22-section research profile of a recruiting company: leadership, financials, culture, tech stack and more.",
      },
      { property: "og:title", content: `Company Intelligence — ${COLLEGE_SHORT} Placement Hub` },
      {
        property: "og:description",
        content: "Deep company research for campus placement preparation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompanyIntelligence,
});

const SectionCard = memo(function SectionCard({
  section,
  index,
  visibleFields,
}: {
  section: IntelligenceSection;
  index: number;
  visibleFields: IntelligenceSection["fields"];
}) {
  const filled = section.fields.filter((f) => f.value !== undefined && !isNullish(f.value)).length;
  const empty = visibleFields.length === 0;

  return (
    <section
      id={`section-${index}`}
      data-idx={index}
      className="scroll-mt-36 rounded-xl border border-atlas-divider bg-atlas-surface"
    >
      <div className="flex items-center gap-3 border-b border-atlas-divider px-4 py-3 sm:px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-atlas-page text-atlas-ink">
          <section.icon className="size-4" />
        </span>
        <h2 className="flex-1 font-heading text-base font-semibold text-atlas-ink">
          {section.title}
        </h2>
        <span className="rounded-full bg-atlas-page px-2 py-0.5 font-mono text-xs text-atlas-text-secondary">
          {filled}/{section.fields.length}
        </span>
      </div>
      {empty ? (
        <p className="px-4 py-4 text-sm italic text-atlas-text-secondary sm:px-5">
          No public fields in this section
        </p>
      ) : (
        <dl className="divide-y divide-atlas-divider">
          {visibleFields.map((f) => (
            <div
              key={f.key}
              className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:gap-4 sm:px-5"
            >
              <dt className="text-atlas-text-secondary sm:w-1/3">{f.label}</dt>
              <dd className="text-atlas-ink sm:w-2/3">
                <FieldValue value={f.value} type={f.type} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
});

function CompanyIntelligence() {
  const { selected } = useCompany();
  const { data, isLoading, isError, error, refetch } = useCompanyProfile(selected?.companyId);
  const sections = useMemo(() => (data ? buildIntelligenceSections(data.profile) : []), [data]);
  const chapters = useMemo(() => groupSectionsByChapter(sections), [sections]);
  const visibleById = useMemo(() => {
    const seen = new Set<string>();
    const map = new Map<string, IntelligenceSection["fields"]>();
    for (const section of sections) {
      const visible = [];
      for (const field of section.fields) {
        if (field.value === undefined || isNullish(field.value)) continue;
        if (seen.has(field.key)) continue;
        seen.add(field.key);
        visible.push(field);
      }
      map.set(section.id, visible);
    }
    return map;
  }, [sections]);

  const [active, setActive] = useState(0);
  const isScrollingRef = useRef(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const sectionIndex = useMemo(() => {
    const map = new Map<string, number>();
    sections.forEach((s, i) => map.set(s.id, i));
    return map;
  }, [sections]);

  const activeSection = sections[active];
  const activeChapterId = useMemo(
    () => chapters.find((ch) => ch.sections.some((s) => s.id === activeSection?.id))?.id,
    [activeSection?.id, chapters],
  );

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(Number((vis[0].target as HTMLElement).dataset["idx"]));
      },
      { rootMargin: "-160px 0px -55% 0px" },
    );
    document.querySelectorAll("[data-idx]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  useEffect(() => {
    const tab = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    tab?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const scrollToSection = useCallback((idx: number) => {
    isScrollingRef.current = true;
    setActive(idx);
    document
      .getElementById(`section-${idx}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  if (isLoading || isError || !data)
    return <CompanyDataState error={error} retry={() => void refetch()} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 lg:hidden">
        <div
          className="flex gap-1 overflow-x-auto pb-2 scrollbar-none"
          role="tablist"
          aria-label="Research chapters"
        >
          {chapters.map((chapter) => {
            const selectedChapter = chapter.id === activeChapterId;
            return (
              <button
                key={chapter.id}
                type="button"
                role="tab"
                aria-selected={selectedChapter}
                onClick={() => {
                  const first = chapter.sections[0];
                  const idx = first ? sectionIndex.get(first.id) : undefined;
                  if (idx !== undefined) scrollToSection(idx);
                }}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                  selectedChapter
                    ? "bg-atlas-ink text-white"
                    : "bg-atlas-surface text-atlas-text-secondary hover:text-atlas-ink",
                )}
              >
                {chapter.title}
              </button>
            );
          })}
        </div>
        <div
          ref={tabsRef}
          className="flex gap-1 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Research sections"
        >
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              data-tab={i}
              role="tab"
              aria-selected={active === i}
              onClick={() => scrollToSection(i)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                active === i
                  ? "bg-atlas-selected font-medium text-atlas-ink"
                  : "text-atlas-text-secondary hover:bg-atlas-surface hover:text-atlas-ink",
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <nav aria-label="Dossier chapters" className="sticky top-36 space-y-5">
            {chapters.map((chapter) => (
              <div key={chapter.id}>
                <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-atlas-text-secondary">
                  {chapter.title}
                </p>
                <ul className="space-y-0.5">
                  {chapter.sections.map((s) => {
                    const idx = sectionIndex.get(s.id) ?? 0;
                    const selectedSection = active === idx;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          aria-current={selectedSection ? "true" : undefined}
                          onClick={() => scrollToSection(idx)}
                          className={cn(
                            "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
                            selectedSection
                              ? "bg-atlas-selected font-medium text-atlas-ink"
                              : "text-atlas-text-secondary hover:bg-atlas-surface hover:text-atlas-ink",
                          )}
                        >
                          {s.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="space-y-8">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="font-heading text-sm font-semibold tracking-tight text-atlas-ink">
                  {chapter.title}
                </h3>
                <div className="h-px flex-1 bg-atlas-divider" />
              </div>
              {chapter.sections.map((s) => {
                const idx = sectionIndex.get(s.id) ?? 0;
                return (
                  <SectionCard
                    key={s.id}
                    section={s}
                    index={idx}
                    visibleFields={visibleById.get(s.id) ?? []}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
