import * as React from "react";
import { Play, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type {
  ApiErrorDetail,
  SkillMatchingPageProps,
  SkillMatchingState,
  SkillMatchResult,
} from "./types";
import { ScoreCard } from "./components/ScoreCard";
import { ConfirmedMatchesSection } from "./components/ConfirmedMatchesSection";
import { PossibleMatchesSection } from "./components/PossibleMatchesSection";
import { MissingSkillsSection } from "./components/MissingSkillsSection";
import { TalentMatchHttpError, talentMatchRequest } from "../api/client";
import { mapTalentMatchError } from "../api/errorMessages";
import { ensureTalentMatchSession } from "../auth/talentMatchSupabaseClient";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

/**
 * SkillMatchingPage: Role 5 Feature Component
 *
 * Compares candidate profile against a specific Job Description.
 * Deterministic scoring, zero LLM, strictly schema-compliant output.
 */
export default function SkillMatchingPage({
  jobDescriptionId,
  runSkillMatch,
  initialResult = null,
  onMatchComplete,
}: SkillMatchingPageProps) {
  const hasSelectedJobDescription = Boolean(jobDescriptionId?.trim());
  const [state, setState] = React.useState<SkillMatchingState>(
    initialResult ? "ready" : hasSelectedJobDescription ? "idle" : "error",
  );
  const [result, setResult] = React.useState<SkillMatchResult | null>(initialResult);
  const [errorDetail, setErrorDetail] = React.useState<ApiErrorDetail | null>(
    hasSelectedJobDescription
      ? null
      : {
          code: "JOB_DESCRIPTION_NOT_SELECTED",
          message: "Select a job description before running skill matching.",
          request_id: "local-client-val",
        },
  );

  const handleExecuteMatch = React.useCallback(async () => {
    // Prevent double submission while in flight
    if (state === "processing") return;

    if (!jobDescriptionId?.trim()) {
      setErrorDetail({
        code: "JOB_DESCRIPTION_NOT_SELECTED",
        message: "Select a job description before running skill matching.",
        request_id: "local-client-val",
      });
      setState("error");
      return;
    }

    setState("processing");
    setErrorDetail(null);

    try {
      let data: SkillMatchResult;

      if (runSkillMatch) {
        data = await runSkillMatch(jobDescriptionId);
      } else {
        // Default seam: the shared Talent Match client (authenticated, configured API base).
        // A raw unauthenticated fetch must never be a fallback path.
        await ensureTalentMatchSession();
        data = await talentMatchRequest<SkillMatchResult>("/api/v1/skill-matching", {
          method: "POST",
          body: JSON.stringify({ job_description_id: jobDescriptionId }),
        });
      }

      setResult(data);
      setState("ready");
      if (onMatchComplete) {
        onMatchComplete(data);
      }
    } catch (err: unknown) {
      const errInfo = err as Partial<ApiErrorDetail>;
      const code = errInfo.code || "MATCH_ERROR";

      if (code === "NO_SKILLS_EXTRACTED" || code === "PROFILE_HAS_NO_SKILLS") {
        setErrorDetail({
          code,
          message:
            errInfo.message ||
            "Unable to match: either candidate profile or job description has no detected skills.",
          request_id: errInfo.request_id || "req-err",
        });
        setState("empty");
      } else {
        const friendly = err instanceof TalentMatchHttpError ? mapTalentMatchError(err) : null;
        setErrorDetail({
          code,
          message:
            friendly?.message ||
            errInfo.message ||
            "An error occurred while running skill matching. Please retry.",
          request_id: errInfo.request_id || "req-err",
        });
        setState("error");
      }
    }
  }, [jobDescriptionId, runSkillMatch, state, onMatchComplete]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      {/* ------------------------------------------------------------------ */}
      {/* State: IDLE                                                        */}
      {/* ------------------------------------------------------------------ */}
      {state === "idle" && (
        <Card className="border-atlas-divider bg-atlas-surface text-center shadow-xs">
          <CardContent className="p-8 sm:p-12 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-atlas-page border border-atlas-divider text-atlas-terracotta">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-atlas-ink font-heading sm:text-2xl">
                Ready to Match Skills
              </h2>
              <p className="mx-auto max-w-md text-sm text-atlas-text-secondary">
                Compare your saved candidate profile against this job description to view confirmed
                coverage, review suggested matches, and identify missing requirements.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                id="run-skill-match-btn"
                size="lg"
                onClick={handleExecuteMatch}
                className="bg-atlas-ink text-atlas-page hover:bg-atlas-ink/90 font-medium"
              >
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                Run Skill Match
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* State: PROCESSING                                                  */}
      {/* ------------------------------------------------------------------ */}
      {state === "processing" && (
        <LoadingSkeleton label="Analyzing job description and profile skills…" />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* State: EMPTY (Precondition: No JD skills / No profile skills)       */}
      {/* ------------------------------------------------------------------ */}
      {state === "empty" && errorDetail && (
        <EmptyState
          title={
            errorDetail.code === "PROFILE_HAS_NO_SKILLS"
              ? "Candidate Profile Has No Skills"
              : "No Requirements Detected in Job Description"
          }
          description={errorDetail.message}
          actionLabel="Retry Match"
          onAction={handleExecuteMatch}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* State: ERROR                                                       */}
      {/* ------------------------------------------------------------------ */}
      {state === "error" && errorDetail && (
        <ErrorState
          title={
            errorDetail.code === "JOB_DESCRIPTION_NOT_SELECTED"
              ? "No Job Description Selected"
              : "Match Request Failed"
          }
          message={errorDetail.message}
          {...(errorDetail.code === "JOB_DESCRIPTION_NOT_SELECTED"
            ? {}
            : { onAction: () => void handleExecuteMatch() })}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* State: READY                                                       */}
      {/* ------------------------------------------------------------------ */}
      {state === "ready" && result && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-atlas-ink font-heading sm:text-3xl">
              Skill Match Analysis
            </h1>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExecuteMatch}
              className="border-atlas-divider text-atlas-ink hover:bg-atlas-page text-xs"
              aria-label="Rerun skill match"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Rerun Match
            </Button>
          </div>

          {/* Put gaps first so the result is actionable before the secondary score summary. */}
          {/* 1. Missing Skills */}
          <MissingSkillsSection missingSkills={result.missing_skills} />

          {/* 2. Confirmed Matches */}
          <ConfirmedMatchesSection matches={result.matched_skills} />

          {/* 3. Possible Matches */}
          <PossibleMatchesSection possibleMatches={result.possible_matches} />

          {/* 4. Score and Disclosure Card */}
          <ScoreCard
            score={result.match_score}
            scoringVersion={result.scoring_version}
            summary={result.summary}
            company={result.company}
            role={result.role}
          />
        </div>
      )}
    </div>
  );
}
