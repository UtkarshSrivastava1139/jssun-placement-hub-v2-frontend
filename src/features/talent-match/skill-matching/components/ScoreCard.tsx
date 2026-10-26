import * as React from "react";
import { Info, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MatchSummary } from "../types";

export interface ScoreCardProps {
  score: number;
  scoringVersion: string;
  summary: MatchSummary;
  company: string | null;
  role: string | null;
}

export function ScoreCard({ score, scoringVersion, summary, company, role }: ScoreCardProps) {
  const [isDisclosureOpen, setIsDisclosureOpen] = React.useState(false);

  // Accessible tone indicator (non-colour only: text badge + icon + percentage)
  const getScoreBand = (val: number) => {
    if (val >= 80) return { label: "Strong Coverage", variant: "default" as const };
    if (val >= 50) return { label: "Moderate Coverage", variant: "secondary" as const };
    return { label: "Developing Coverage", variant: "outline" as const };
  };

  const band = getScoreBand(score);

  return (
    <Card className="border-atlas-divider bg-atlas-surface shadow-xs">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Role and Coverage Information */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-atlas-text-secondary">
                Deterministic Skill Match
              </span>
              <Badge variant="outline" className="border-atlas-divider text-xs font-mono">
                {scoringVersion}
              </Badge>
              <Badge variant={band.variant} className="text-xs">
                {band.label}
              </Badge>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-atlas-ink sm:text-2xl font-heading">
              {role || "Target Role"}{" "}
              {company && (
                <span className="font-normal text-atlas-text-secondary">at {company}</span>
              )}
            </h2>

            <p className="text-sm text-atlas-text-secondary">
              Matched {summary.confirmed_matches} of {summary.unique_requirements} unique
              requirements.
              {summary.possible_count > 0 && (
                <span className="ml-1 text-atlas-terracotta">
                  ({summary.possible_count} possible{" "}
                  {summary.possible_count === 1 ? "match" : "matches"} under review)
                </span>
              )}
            </p>
          </div>

          {/* Right: Score Display */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center rounded-xl border border-atlas-divider bg-atlas-page px-6 py-4 text-center">
              <span className="text-xs font-medium text-atlas-text-secondary uppercase tracking-wider">
                Match Score
              </span>
              <div className="flex items-baseline gap-0.5">
                <span
                  className="text-4xl font-extrabold text-atlas-ink font-heading"
                  aria-label={`Match score: ${score} percent`}
                >
                  {score}
                </span>
                <span className="text-lg font-medium text-atlas-text-secondary">%</span>
              </div>
              <span className="text-[11px] text-atlas-text-secondary">Requirement Coverage</span>
            </div>
          </div>
        </div>

        {/* Disclosure Toggle */}
        <div className="mt-6 border-t border-atlas-divider pt-4">
          <button
            type="button"
            id="calculation-disclosure-btn"
            aria-expanded={isDisclosureOpen}
            aria-controls="calculation-disclosure-content"
            onClick={() => setIsDisclosureOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left text-xs font-medium text-atlas-text-secondary hover:text-atlas-ink transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-atlas-focus rounded-sm py-1"
          >
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Info className="h-4 w-4 text-atlas-terracotta shrink-0" aria-hidden="true" />
              How is this score calculated?
            </span>
            {isDisclosureOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </button>

          {isDisclosureOpen && (
            <div
              id="calculation-disclosure-content"
              role="region"
              aria-labelledby="calculation-disclosure-btn"
              className="mt-3 space-y-3 rounded-lg border border-atlas-divider bg-atlas-page p-4 text-xs text-atlas-text-secondary"
            >
              <div className="space-y-1">
                <p className="font-semibold text-atlas-ink">Deterministic sm-v1 Scoring Formula</p>
                <p>
                  Each unique requirement is weighted by priority:{" "}
                  <strong className="text-atlas-ink">Required = 2</strong>,{" "}
                  <strong className="text-atlas-ink">Preferred = 1</strong>, and{" "}
                  <strong className="text-atlas-ink">Unknown Priority = 1</strong>.
                </p>
                <code className="block rounded bg-atlas-surface p-2 font-mono text-[11px] text-atlas-ink border border-atlas-divider">
                  score = floor(100 × (confirmed_weights) / (total_weights) + 0.5)
                </code>
              </div>

              <div className="space-y-1 border-t border-atlas-divider pt-2">
                <p className="font-semibold text-atlas-ink">Possible Matches Policy</p>
                <p>
                  Skills with typo or synonym similarities (&ge;90%) are surfaced as{" "}
                  <em>possible matches</em> for candidate review. They are{" "}
                  <strong>strictly excluded from confirmed coverage</strong> and do not raise the
                  score.
                </p>
              </div>

              <div className="flex items-start gap-2 rounded border border-atlas-divider bg-atlas-surface p-2.5 text-atlas-ink">
                <ShieldCheck
                  className="h-4 w-4 shrink-0 text-atlas-success mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-[11px] leading-relaxed">{summary.interpretation_notice}</p>
              </div>

              <p className="text-[11px] italic text-atlas-text-secondary">
                Notice: This assessment measures structured curriculum and JD requirement coverage
                only. It does not predict hiring probability, interview selection, stipend, or
                compensation.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
