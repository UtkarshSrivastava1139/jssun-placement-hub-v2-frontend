import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ChevronDown, Lock, Target } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import {
  proficiencyToBloom,
  type Bloom,
  type Criticality,
  type DashboardSkill,
} from "@/lib/companyData";
import { useCompanySkills } from "@/lib/companyApi";
import { CompanyDataState } from "@/components/CompanyDataState";
import { COLLEGE_SHORT } from "@/lib/college";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/company/skills")({
  head: () => ({
    meta: [
      { title: `Skill Intelligence — ${COLLEGE_SHORT} Placement Hub` },
      {
        name: "description",
        content:
          "Skills a recruiter expects, with Bloom levels, criticality and a 10-level learning roadmap.",
      },
      { property: "og:title", content: `Skill Intelligence — ${COLLEGE_SHORT} Placement Hub` },
      { property: "og:description", content: "Know exactly which skills to build and how far." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkillIntelligence,
});

const BLOOM: Record<
  Bloom,
  { label: string; range: string; text: string; bg: string; bar: string }
> = {
  CU: {
    label: "Understand",
    range: "L1–2",
    text: "text-bloom-cu",
    bg: "bg-bloom-cu/10",
    bar: "bg-bloom-cu",
  },
  AP: {
    label: "Apply",
    range: "L3–4",
    text: "text-bloom-ap",
    bg: "bg-bloom-ap/10",
    bar: "bg-bloom-ap",
  },
  AS: {
    label: "Analyse",
    range: "L5–6",
    text: "text-bloom-as",
    bg: "bg-bloom-as/10",
    bar: "bg-bloom-as",
  },
  EV: {
    label: "Evaluate",
    range: "L7–8",
    text: "text-bloom-ev",
    bg: "bg-bloom-ev/10",
    bar: "bg-bloom-ev",
  },
  CR: {
    label: "Create",
    range: "L9–10",
    text: "text-bloom-cr",
    bg: "bg-bloom-cr/10",
    bar: "bg-bloom-cr",
  },
};

const CRIT: Record<Criticality, { desc: string; text: string; bg: string }> = {
  Critical: { desc: "Score 7+ · must master", text: "text-expert", bg: "bg-expert/10" },
  Important: {
    desc: "Score 5–6 · strong working level",
    text: "text-advanced",
    bg: "bg-advanced/10",
  },
  Baseline: {
    desc: "Below 5 · foundational awareness",
    text: "text-beginner",
    bg: "bg-beginner/10",
  },
};

type CritFilter = "All" | Criticality;

function topicLabel(topic: string) {
  return topic.trim().toLowerCase() === "not available" ? "Not publicly available" : topic;
}

function SkillCard({ skill, topics }: { skill: DashboardSkill; topics: string[] }) {
  const [open, setOpen] = useState(skill.criticality === "Critical");
  const b = BLOOM[skill.bloom];
  const c = CRIT[skill.criticality];
  return (
    <div className="rounded-xl border border-atlas-divider bg-atlas-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 text-left sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-semibold text-atlas-ink">{skill.name}</h3>
              <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", b.bg, b.text)}>
                {skill.bloom}
              </span>
            </div>
            <p className={cn("mt-1 text-xs font-medium", c.text)}>
              {skill.criticality} · {skill.proficiency}
            </p>
          </div>
          <span className="font-heading text-lg font-semibold text-atlas-ink">
            {skill.score}
            <span className="text-sm text-atlas-text-secondary">/10</span>
          </span>
          <ChevronDown
            className={cn(
              "mt-1 size-4 text-atlas-text-secondary transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-atlas-page">
          <div
            className={cn("h-full rounded-full", b.bar)}
            style={{ width: `${skill.score * 10}%` }}
          />
        </div>
      </button>
      {open && (
        <ol className="border-t border-atlas-divider px-4 py-3 sm:px-5">
          {topics.map((t, i) => {
            const level = i + 1;
            const locked = level > skill.score;
            const unpublished = t.trim().toLowerCase() === "not available";
            const lb = BLOOM[proficiencyToBloom(level)];
            return (
              <li
                key={level}
                className={cn(
                  "flex items-center gap-3 py-1.5 text-sm",
                  (locked || unpublished) && "text-atlas-text-secondary",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    locked ? "bg-atlas-page text-atlas-text-secondary" : cn(lb.bg, lb.text),
                  )}
                >
                  {level}
                </span>
                <span className={cn("flex-1", unpublished && "italic")}>{topicLabel(t)}</span>
                {locked ? (
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Lock className="size-3.5" /> Beyond scope
                  </span>
                ) : level === skill.score ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-atlas-focus">
                    <Target className="size-3.5" /> Target
                  </span>
                ) : (
                  <CheckCircle2 className="size-4 text-standard" />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function SkillIntelligence() {
  const { selected } = useCompany();
  const skillsQuery = useCompanySkills(selected?.companyId);
  const [filter, setFilter] = useState<CritFilter>("All");

  if (skillsQuery.isLoading || skillsQuery.isError || !skillsQuery.data) {
    return <CompanyDataState error={skillsQuery.error} retry={() => void skillsQuery.refetch()} />;
  }

  const { skills, topics } = skillsQuery.data;
  const visible = filter === "All" ? skills : skills.filter((s) => s.criticality === filter);
  const filters: CritFilter[] = ["All", "Critical", "Important", "Baseline"];

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-atlas-text-secondary">
          Preparation ladder
        </p>
        <h2 className="mt-1 font-heading text-xl font-semibold text-atlas-ink">
          Skill intelligence
        </h2>
        <p className="mt-1 text-sm text-atlas-text-secondary">
          {skills.length} skills expected by recruiters, sorted by required level
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-atlas-divider bg-atlas-surface p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(BLOOM) as Bloom[]).map((k) => (
            <span
              key={k}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
                BLOOM[k].bg,
                BLOOM[k].text,
              )}
            >
              <span className="font-heading font-bold">{k}</span>
              {BLOOM[k].label}
              <span className="font-mono text-[10px] opacity-70">{BLOOM[k].range}</span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CRIT) as Criticality[]).map((k) => (
            <span
              key={k}
              className={cn(
                "inline-flex rounded px-2 py-0.5 text-[11px] font-semibold",
                CRIT[k].bg,
                CRIT[k].text,
              )}
              title={CRIT[k].desc}
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter skills by criticality"
        className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-atlas-divider bg-atlas-surface p-0.5"
      >
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus",
              filter === f
                ? "bg-atlas-ink text-white"
                : "text-atlas-text-secondary hover:bg-atlas-page hover:text-atlas-ink",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {skills.length === 0 ? (
          <div className="rounded-lg border border-dashed border-atlas-divider bg-atlas-surface px-4 py-16 text-center">
            <p className="text-sm font-semibold text-atlas-ink">
              No skill data available for this company
            </p>
            <p className="mt-1 text-xs text-atlas-text-secondary">
              Recruiters have not published a preparation ladder for this organization yet.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-atlas-divider bg-atlas-surface px-4 py-12 text-center">
            <p className="text-sm font-semibold text-atlas-ink">
              No {filter.toLowerCase()} skills in this ladder
            </p>
          </div>
        ) : (
          visible.map((s) => <SkillCard key={s.id} skill={s} topics={topics[s.id] ?? []} />)
        )}
      </div>
    </div>
  );
}
