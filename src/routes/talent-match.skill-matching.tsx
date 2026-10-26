import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ensureTalentMatchSession } from "@/features/talent-match/auth/talentMatchSupabaseClient";
import { talentMatchRequest } from "@/features/talent-match/api/client";
import { SkillMatchingPage } from "@/features/talent-match/skill-matching";
import type { SkillMatchResult } from "@/features/talent-match/skill-matching/types";
import type { SavedJobDescriptionRecord } from "@/features/talent-match/jd-analytics/types";
import {
  SYNTHETIC_MOCK_SKILL_MATCH_RESULT,
  SYNTHETIC_SAVED_JOB_DESCRIPTION,
} from "@/features/talent-match/skill-matching/fixtures/mockResult";

export const Route = createFileRoute("/talent-match/skill-matching")({
  head: () => ({
    meta: [
      { title: "Skill Matching — JSSUN Placement Intelligence Hub" },
      {
        name: "description",
        content: "Compare your saved candidate profile with a specific saved job description.",
      },
    ],
  }),
  component: SkillMatchingRoute,
});

function SkillMatchingRoute() {
  const [jobs, setJobs] = useState<SavedJobDescriptionRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usingDevelopmentFixture, setUsingDevelopmentFixture] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await ensureTalentMatchSession();
        const response = await talentMatchRequest<{ items: SavedJobDescriptionRecord[] }>(
          "/api/v1/job-descriptions",
        );
        if (active) {
          setJobs(response.items);
          setSelectedJobId(response.items[0]?.job_description_id ?? "");
        }
      } catch (error) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Saved job descriptions could not be loaded.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedJob = jobs.find((job) => job.job_description_id === selectedJobId);
  const skillMatchingProps = usingDevelopmentFixture
    ? {
        jobDescriptionId: selectedJob?.job_description_id ?? "",
        initialResult: SYNTHETIC_MOCK_SKILL_MATCH_RESULT,
      }
    : {
        jobDescriptionId: selectedJob?.job_description_id ?? "",
        initialResult: null,
        runSkillMatch: (jobDescriptionId: string) =>
          talentMatchRequest<SkillMatchResult>("/api/v1/skill-matching", {
            method: "POST",
            body: JSON.stringify({ job_description_id: jobDescriptionId }),
          }),
      };

  return (
    <main className="mx-auto max-w-5xl space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-atlas-terracotta">
              Talent Match · Role 5
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-atlas-ink">
              Skill Matching
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-atlas-text-secondary">
              Select a saved job description to compare its evidence-backed requirements with your
              saved candidate profile.
            </p>
          </header>

          {loading && <p role="status" className="text-sm text-atlas-text-secondary">Loading saved job descriptions…</p>}
          {loadError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {loadError}
            </p>
          )}
          {!loading && !loadError && jobs.length === 0 && (
            <section className="rounded-lg border border-atlas-divider bg-atlas-surface p-6">
              <h2 className="font-heading text-lg font-semibold">No saved job descriptions</h2>
              <p className="mt-2 text-sm text-atlas-text-secondary">
                Analyze and save a job description in JD Analytics before running Skill Matching.
              </p>
              <Link
                to="/talent-match/jd-analytics"
                className="mt-4 inline-flex rounded-md bg-atlas-ink px-4 py-2 text-sm font-medium text-atlas-page"
              >
                Open JD Analytics
              </Link>
              {import.meta.env.DEV && (
                <button
                  type="button"
                  className="ml-3 rounded-md border border-atlas-divider px-4 py-2 text-sm font-medium text-atlas-ink"
                  onClick={() => {
                    setJobs([SYNTHETIC_SAVED_JOB_DESCRIPTION]);
                    setSelectedJobId(SYNTHETIC_SAVED_JOB_DESCRIPTION.job_description_id);
                    setUsingDevelopmentFixture(true);
                  }}
                >
                  Use synthetic development JD
                </button>
              )}
            </section>
          )}
          {!loading && !loadError && jobs.length > 0 && (
            <>
              <label className="block max-w-xl text-sm font-medium text-atlas-ink" htmlFor="skill-match-job">
                Saved job description
                <select
                  id="skill-match-job"
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  className="mt-2 block w-full rounded-md border border-atlas-divider bg-atlas-surface px-3 py-2 text-sm"
                >
                  {jobs.map((job) => (
                    <option key={job.job_description_id} value={job.job_description_id}>
                      {[job.extraction.role, job.extraction.company, job.extraction.source_file]
                        .filter(Boolean)
                        .join(" · ")}
                    </option>
                  ))}
                </select>
              </label>
              {selectedJob && (
                <>
                  {usingDevelopmentFixture && (
                    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      Development-only synthetic JD. This is not saved to Supabase or representative
                      of a real company requirement.
                    </p>
                  )}
                  <SkillMatchingPage {...skillMatchingProps} />
                </>
              )}
            </>
          )}
    </main>
  );
}
