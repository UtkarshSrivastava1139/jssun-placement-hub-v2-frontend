import { Link } from "@tanstack/react-router";
import { Check, Circle, FileText, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { talentMatchRequest, TalentMatchHttpError } from "../api/client";
import { ensureTalentMatchSession } from "../auth/talentMatchSupabaseClient";
import { ErrorState } from "../components/ErrorState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import type { SavedProfileRecord } from "../profile-builder/types";
import type { SavedJobDescriptionRecord } from "../jd-analytics/types";

type Assessment = {
  assessment_id: string;
  assessment_type: "talent_check" | "skill_match";
  company_key: "google" | "microsoft" | "oracle_fss" | null;
  job_description_id: string | null;
  score: number;
  created_at: string;
};

type AssessmentList = { items: Assessment[] };
type HomeData = {
  profile: SavedProfileRecord | null;
  jobDescriptions: SavedJobDescriptionRecord[];
  assessments: Assessment[];
};

const COMPANY_NAMES: Record<NonNullable<Assessment["company_key"]>, string> = {
  google: "Google LLC",
  microsoft: "Microsoft Corporation",
  oracle_fss: "Oracle Financial Services Software",
};

const steps = [
  { label: "Resume", href: "/talent-match/resume-parsing" },
  { label: "Profile", href: "/talent-match/profile" },
  { label: "Job Description", href: "/talent-match/jd-analytics" },
  { label: "Talent Check", href: "/talent-match/talent-check" },
  { label: "Skill Match", href: "/talent-match/skill-matching" },
] as const;

function isNotFound(error: unknown) {
  return error instanceof TalentMatchHttpError && error.status === 404;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function hasResumeDraftInSession() {
  try {
    return Boolean(sessionStorage.getItem("talent-match.resume-profile-draft.v1"));
  } catch {
    return false;
  }
}

function StatusIcon({ status }: { status: "not started" | "saved" | "done" }) {
  if (status === "done") return <Check className="size-4" aria-hidden />;
  if (status === "saved") return <Circle className="size-3 fill-current" aria-hidden />;
  return <X className="size-4" aria-hidden />;
}

function ScoreCard({
  title,
  score,
  detail,
  href,
}: {
  title: string;
  score: number | null;
  detail: string;
  href: string;
}) {
  return (
    <article className="border border-atlas-divider bg-atlas-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-atlas-text-secondary">{title}</p>
          {score === null ? (
            <p className="mt-4 text-sm text-atlas-text-secondary">No result yet</p>
          ) : (
            <p className="mt-2 font-heading text-4xl font-semibold text-atlas-ink">{score}<span className="text-xl">/100</span></p>
          )}
        </div>
        <FileText className="size-5 text-atlas-terracotta" aria-hidden />
      </div>
      <p className="mt-3 min-h-10 text-sm text-atlas-text-secondary">{detail}</p>
      {score === null && (
        <Link className="mt-3 inline-flex text-sm font-semibold text-atlas-terracotta hover:underline" to={href}>
          Get started →
        </Link>
      )}
    </article>
  );
}

export function TalentMatchHomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await ensureTalentMatchSession();
        const [profileResult, jdResult, assessmentResult] = await Promise.allSettled([
          talentMatchRequest<SavedProfileRecord>("/api/v1/profile"),
          talentMatchRequest<{ items: SavedJobDescriptionRecord[] }>("/api/v1/job-descriptions"),
          talentMatchRequest<AssessmentList>("/api/v1/assessments?limit=50"),
        ]);
        if (!active) return;
        const profile = profileResult.status === "fulfilled" ? profileResult.value : isNotFound(profileResult.reason) ? null : null;
        const jobDescriptions = jdResult.status === "fulfilled" ? jdResult.value.items : isNotFound(jdResult.reason) ? [] : null;
        const assessments = assessmentResult.status === "fulfilled" ? assessmentResult.value.items : [];
        if (
          (profileResult.status === "rejected" && !isNotFound(profileResult.reason)) ||
          jobDescriptions === null ||
          (assessmentResult.status === "rejected" && !isNotFound(assessmentResult.reason))
        ) {
          throw new Error("Unable to load your Talent Match progress.");
        }
        setData({ profile, jobDescriptions, assessments });
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const state = useMemo(() => {
    const profile = data?.profile;
    const hasResume = hasResumeDraftInSession() || Boolean(profile?.profile.skills.some((skill) => skill.provenance === "resume_extraction"));
    const hasProfile = Boolean(profile);
    const hasJd = Boolean(data?.jobDescriptions.length);
    const hasTalentCheck = Boolean(data?.assessments.some((assessment) => assessment.assessment_type === "talent_check"));
    const hasSkillMatch = Boolean(data?.assessments.some((assessment) => assessment.assessment_type === "skill_match"));
    const statuses = [hasResume ? "done" : "not started", hasProfile ? "saved" : "not started", hasJd ? "saved" : "not started", hasTalentCheck ? "done" : "not started", hasSkillMatch ? "done" : "not started"] as const;
    const next = !hasProfile
      ? steps[0]
      : !hasJd
        ? steps[2]
        : !hasTalentCheck
          ? steps[3]
          : !hasSkillMatch
            ? steps[4]
            : steps[4];
    return { statuses, next };
  }, [data]);

  const latestReadiness = data?.assessments.filter((item) => item.assessment_type === "talent_check").sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const latestMatch = data?.assessments.filter((item) => item.assessment_type === "skill_match").sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const matchJob = data?.jobDescriptions.find((job) => job.job_description_id === latestMatch?.job_description_id);

  if (loading) {
    return <LoadingSkeleton label="Loading Talent Match progress" rows={2} />;
  }
  if (error) {
    return <ErrorState title="We couldn’t load your progress" message="Please try again in a moment." onAction={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-8">
      <section className="border border-atlas-divider bg-atlas-surface p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-atlas-text-secondary"><UserRound className="size-4 text-atlas-terracotta" aria-hidden />Your Talent Match journey</div>
        <ol className="mt-6 grid gap-4 sm:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.label} className="relative">
              <Link to={step.href} className="group block">
                <span className={`flex size-8 items-center justify-center rounded-full text-sm ${(state.statuses[index] ?? "not started") === "not started" ? "border border-atlas-divider text-atlas-text-secondary" : "bg-atlas-terracotta text-white"}`}><StatusIcon status={state.statuses[index] ?? "not started"} /></span>
                <span className="mt-2 block text-sm font-semibold text-atlas-ink">{step.label}</span>
                <span className="mt-1 block text-xs capitalize text-atlas-text-secondary">{state.statuses[index] ?? "not started"}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <section className="flex flex-col justify-between gap-4 rounded-lg bg-atlas-ink p-6 text-white sm:flex-row sm:items-center">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-atlas-terracotta">Next step</p><h2 className="mt-2 font-heading text-2xl font-semibold">{data?.profile ? "Keep building your match" : "Start with your resume"}</h2><p className="mt-1 text-sm text-white/70">A few minutes here makes your results more useful and explainable.</p></div>
        <Link to={state.next.href} className="inline-flex shrink-0 items-center justify-center rounded-md bg-atlas-terracotta px-5 py-3 text-sm font-semibold text-white hover:bg-atlas-terracotta/90">{data?.profile ? `Continue with ${state.next.label}` : "Upload your resume"} </Link>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <ScoreCard title="Latest readiness" score={latestReadiness?.score ?? null} detail={latestReadiness ? `${latestReadiness.company_key ? COMPANY_NAMES[latestReadiness.company_key] : "Target company"} · ${formatDate(latestReadiness.created_at)}` : "Complete your profile and Talent Check to see how ready you are for a target company."} href="/talent-match/talent-check" />
        <ScoreCard title="Latest skill match" score={latestMatch?.score ?? null} detail={latestMatch ? `${matchJob?.extraction.role || "Saved job description"} · ${formatDate(latestMatch.created_at)}` : "Save a job description to compare your evidence with a specific opportunity."} href="/talent-match/jd-analytics" />
      </section>
    </div>
  );
}
