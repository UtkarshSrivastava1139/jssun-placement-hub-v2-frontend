import { CheckCircle2, Circle } from "lucide-react";
import { RADIX_CATEGORIES, type CategoryCode } from "../profile-builder/types";

const CATEGORY_LABELS: Record<CategoryCode, string> = {
  COD: "Coding",
  DSA: "Data Structures & Algorithms",
  OOD: "Object-Oriented Design",
  APTI: "Aptitude",
  COMM: "Communication",
  AI: "AI",
  CLOUD: "Cloud",
  SQL: "SQL",
  SWE: "Software Engineering",
  SYSD: "System Design",
  NETW: "Networking",
  OS: "Operating Systems",
};

type Props = {
  completedCodes?: readonly string[];
  missingCodes?: readonly string[];
  title?: string;
};

export function CategoryCompletionChecklist({
  completedCodes = [],
  missingCodes = [],
  title = "12-category completion",
}: Props) {
  const completed = new Set(completedCodes);
  const missing = new Set(missingCodes);
  const completedCount = RADIX_CATEGORIES.filter((code) => completed.has(code)).length;
  const firstMissing = RADIX_CATEGORIES.find((code) => missing.has(code));

  return (
    <div
      className="rounded-xl border border-atlas-divider bg-atlas-surface p-5"
      data-testid="category-completion-checklist"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-atlas-terracotta">
            {title}
          </p>
          <p className="mt-1 text-sm text-atlas-text-secondary">
            {completedCount} of {RADIX_CATEGORIES.length} categories assessed
          </p>
        </div>
        <span className="font-heading text-2xl font-semibold text-atlas-ink">
          {Math.round((completedCount / RADIX_CATEGORIES.length) * 100)}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-atlas-selected">
        <div
          className="h-full rounded-full bg-atlas-terracotta transition-all"
          style={{ width: `${(completedCount / RADIX_CATEGORIES.length) * 100}%` }}
        />
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {RADIX_CATEGORIES.map((code) => {
          const isComplete = completed.has(code);
          const isMissing = missing.has(code);
          return (
            <li key={code}>
              <a
                href={`/talent-match/profile#assessment-${code}`}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                  isMissing
                    ? "bg-atlas-danger/10 font-semibold text-atlas-danger"
                    : isComplete
                      ? "text-atlas-success"
                      : "text-atlas-text-secondary"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                <span>{code}</span>
                <span className="sr-only"> {CATEGORY_LABELS[code]}</span>
              </a>
            </li>
          );
        })}
      </ul>
      {firstMissing && (
        <a
          href={`/talent-match/profile#assessment-${firstMissing}`}
          className="mt-4 inline-flex text-sm font-medium text-atlas-terracotta hover:underline"
        >
          Complete {firstMissing} first →
        </a>
      )}
    </div>
  );
}
