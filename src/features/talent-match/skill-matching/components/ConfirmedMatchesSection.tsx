import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MatchedSkill } from "../types";

export interface ConfirmedMatchesSectionProps {
  matches: MatchedSkill[];
}

export function ConfirmedMatchesSection({ matches }: ConfirmedMatchesSectionProps) {
  if (matches.length === 0) {
    return (
      <section aria-labelledby="confirmed-matches-heading" className="space-y-3">
        <h3
          id="confirmed-matches-heading"
          className="text-base font-semibold text-atlas-ink font-heading flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-atlas-success" aria-hidden="true" />
          Confirmed Matches (0)
        </h3>
        <p className="text-xs text-atlas-text-secondary rounded-lg border border-atlas-divider bg-atlas-surface p-4">
          No confirmed skill matches found for this job description.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="confirmed-matches-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          id="confirmed-matches-heading"
          className="text-base font-semibold text-atlas-ink font-heading flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-atlas-success" aria-hidden="true" />
          Confirmed Matches ({matches.length})
        </h3>
        <span className="text-xs text-atlas-text-secondary">Counted in Match Score</span>
      </div>

      <div className="space-y-3">
        {matches.map((item, idx) => {
          const req = item.requirement;
          const isAlias = item.match_method === "alias";
          const hasCategoryMismatch =
            item.candidate_category_code &&
            req.category_code &&
            item.candidate_category_code !== req.category_code &&
            item.candidate_category_code !== "OTHER" &&
            req.category_code !== "OTHER";

          return (
            <Card
              key={`${req.skill_name}-${idx}`}
              className="border-atlas-divider bg-atlas-surface shadow-2xs"
            >
              <CardContent className="p-4 space-y-3">
                {/* Header row: Skill name, match type, priority badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-atlas-divider pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-atlas-ink font-heading">
                      {req.skill_name}
                    </span>
                    {isAlias && (
                      <span className="text-xs text-atlas-text-secondary flex items-center gap-1 font-mono">
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        Matched as &ldquo;{item.candidate_skill_name}&rdquo;
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="border-atlas-divider text-[11px] font-mono">
                      {req.category_code}
                    </Badge>
                    <Badge
                      variant={isAlias ? "secondary" : "default"}
                      className="text-[11px] capitalize"
                    >
                      {isAlias ? "Approved Alias" : "Exact Match"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        req.requirement_type === "required"
                          ? "border-atlas-terracotta text-atlas-terracotta"
                          : req.requirement_type === "unknown"
                            ? "border-atlas-divider text-atlas-text-secondary"
                            : "border-atlas-divider text-atlas-text-secondary"
                      }`}
                    >
                      {req.requirement_type === "unknown"
                        ? "Unknown Priority (Weight 1)"
                        : `${req.requirement_type} (Weight ${req.weight})`}
                    </Badge>
                  </div>
                </div>

                {/* Category mismatch alert if present */}
                {hasCategoryMismatch && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded border border-atlas-terracotta/40 bg-atlas-terracotta/10 p-2 text-xs text-atlas-ink"
                  >
                    <AlertTriangle
                      className="h-4 w-4 shrink-0 text-atlas-terracotta mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Category Discrepancy:</strong> JD categorises as{" "}
                      <code>{req.category_code}</code>, but profile lists as{" "}
                      <code>{item.candidate_category_code}</code>.
                    </span>
                  </div>
                )}

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
                      Candidate Profile Evidence:
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
