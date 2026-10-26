import * as React from "react";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Requirement, RequirementType } from "../types";

export interface MissingSkillsSectionProps {
  missingSkills: Requirement[];
}

export function MissingSkillsSection({ missingSkills }: MissingSkillsSectionProps) {
  // Ensure priority sorting: required first, unknown second, preferred third
  const sortedMissing = React.useMemo(() => {
    const priorityWeight: Record<RequirementType, number> = {
      required: 1,
      unknown: 2,
      preferred: 3,
    };
    return [...missingSkills].sort(
      (a, b) =>
        (priorityWeight[a.requirement_type] ?? 99) - (priorityWeight[b.requirement_type] ?? 99),
    );
  }, [missingSkills]);

  if (missingSkills.length === 0) {
    return (
      <section aria-labelledby="missing-skills-heading" className="space-y-3">
        <h3
          id="missing-skills-heading"
          className="text-base font-semibold text-atlas-ink font-heading flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 text-atlas-text-secondary" aria-hidden="true" />
          Missing Skills (0)
        </h3>
        <p className="text-xs text-atlas-text-secondary rounded-lg border border-atlas-divider bg-atlas-surface p-4">
          All extracted requirements from this job description were matched in your profile!
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="missing-skills-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          id="missing-skills-heading"
          className="text-base font-semibold text-atlas-ink font-heading flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 text-atlas-danger" aria-hidden="true" />
          Missing Requirements ({missingSkills.length})
        </h3>
        <span className="text-xs text-atlas-text-secondary">Required first</span>
      </div>

      <div className="space-y-3">
        {sortedMissing.map((req, idx) => {
          const isRequired = req.requirement_type === "required";
          const isUnknown = req.requirement_type === "unknown";

          return (
            <Card
              key={`${req.skill_name}-${idx}`}
              className="border-atlas-divider bg-atlas-surface shadow-2xs"
            >
              <CardContent className="p-4 space-y-2.5">
                {/* Header row: Skill name, category, priority badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-atlas-divider pb-2">
                  <span className="font-semibold text-sm text-atlas-ink font-heading">
                    {req.skill_name}
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="border-atlas-divider text-[11px] font-mono">
                      {req.category_code}
                    </Badge>

                    {isRequired ? (
                      <Badge variant="destructive" className="text-[11px]">
                        Required (Weight 2)
                      </Badge>
                    ) : isUnknown ? (
                      <Badge
                        variant="outline"
                        className="border-atlas-divider bg-atlas-page text-atlas-text-secondary text-[11px] font-mono flex items-center gap-1"
                      >
                        <HelpCircle className="h-3 w-3" aria-hidden="true" />
                        [UNKNOWN PRIORITY — WEIGHT 1]
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">
                        Preferred (Weight 1)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* JD Context */}
                <div className="rounded border border-atlas-divider bg-atlas-page p-2.5 text-xs">
                  <span className="font-medium text-atlas-text-secondary block mb-1">
                    Job Description Context:
                  </span>
                  <p className="text-atlas-ink italic">
                    &ldquo;{req.evidence || "No JD excerpt recorded."}&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
