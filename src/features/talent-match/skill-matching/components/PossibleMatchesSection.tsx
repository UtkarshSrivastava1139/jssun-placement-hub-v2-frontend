import { HelpCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PossibleMatch } from "../types";

export interface PossibleMatchesSectionProps {
  possibleMatches: PossibleMatch[];
}

export function PossibleMatchesSection({ possibleMatches }: PossibleMatchesSectionProps) {
  if (possibleMatches.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="possible-matches-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          id="possible-matches-heading"
          className="text-base font-semibold text-atlas-ink font-heading flex items-center gap-2"
        >
          <HelpCircle className="h-4 w-4 text-atlas-terracotta" aria-hidden="true" />
          Possible Matches Under Review ({possibleMatches.length})
        </h3>
        <span className="text-xs text-atlas-text-secondary">
          Possible matches do not change the score
        </span>
      </div>

      {/* Advisory notice banner */}
      <div
        role="region"
        aria-label="Possible matches guidance"
        className="flex items-start gap-2.5 rounded-lg border border-atlas-terracotta/30 bg-atlas-terracotta/5 p-3 text-xs text-atlas-ink"
      >
        <AlertCircle className="h-4 w-4 shrink-0 text-atlas-terracotta mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-atlas-ink">
            Action Recommended: Candidate Profile Review
          </p>
          <p className="text-atlas-text-secondary leading-relaxed">
            These skills resemble JD requirements (&ge;90% similarity) but were not matched as exact
            or approved aliases. To count them toward your score, correct the skill spelling in your
            candidate profile and rerun.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {possibleMatches.map((item, idx) => {
          const req = item.requirement;
          const similarityPct = Math.round(item.similarity);

          return (
            <Card
              key={`${req.skill_name}-${idx}`}
              className="border-atlas-divider bg-atlas-surface shadow-2xs"
            >
              <CardContent className="p-4 space-y-3">
                {/* Header row: JD skill vs Profile skill */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-atlas-divider pb-2.5">
                  <div className="space-y-0.5">
                    <span className="text-xs text-atlas-text-secondary block">
                      Target Requirement:
                    </span>
                    <span className="font-semibold text-sm text-atlas-ink font-heading">
                      {req.skill_name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="border-atlas-divider text-[11px] font-mono">
                      {req.category_code}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px] font-mono">
                      {similarityPct}% similarity
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-atlas-terracotta/50 text-atlas-terracotta text-[11px]"
                    >
                      Needs Review
                    </Badge>
                  </div>
                </div>

                {/* Candidate skill & hint */}
                <div className="rounded border border-atlas-terracotta/20 bg-atlas-page p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-atlas-text-secondary">Found in profile:</span>
                    <code className="rounded bg-atlas-surface px-1.5 py-0.5 font-mono text-atlas-ink border border-atlas-divider">
                      {item.candidate_skill_name}
                    </code>
                  </div>
                  <p className="text-atlas-text-secondary flex items-start gap-1.5">
                    <RefreshCw
                      className="h-3.5 w-3.5 shrink-0 text-atlas-terracotta mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      Looks similar to <strong>&ldquo;{item.candidate_skill_name}&rdquo;</strong>.
                      If this is the same skill as <strong>&ldquo;{req.skill_name}&rdquo;</strong>,
                      rename the skill in your profile and rerun matching.
                    </span>
                  </p>
                </div>

                {/* Evidence snippets */}
                <div className="grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded border border-atlas-divider bg-atlas-page p-2.5">
                    <span className="font-medium text-atlas-text-secondary block mb-1">
                      Job Description Context:
                    </span>
                    <p className="text-atlas-ink italic">
                      &ldquo;{req.evidence || "No JD excerpt recorded."}&rdquo;
                    </p>
                  </div>
                  <div className="rounded border border-atlas-divider bg-atlas-page p-2.5">
                    <span className="font-medium text-atlas-text-secondary block mb-1">
                      Candidate Profile Context:
                    </span>
                    <p className="text-atlas-ink">
                      {item.candidate_evidence || "No supporting evidence recorded."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
