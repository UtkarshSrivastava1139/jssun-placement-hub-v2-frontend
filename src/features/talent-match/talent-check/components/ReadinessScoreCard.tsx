import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORY_METADATA, TalentCheckResult } from '../types';
import {
  Award,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  FileText,
  Printer,
  TrendingUp,
  Target,
  ArrowRight,
} from 'lucide-react';

interface ReadinessScoreCardProps {
  result: TalentCheckResult;
}

export const ReadinessScoreCard: React.FC<ReadinessScoreCardProps> = ({ result }) => {
  const {
    readiness_score,
    company_name,
    scoring_version,
    summary,
    assessment_coverage,
    evidence_coverage,
    created_at,
    skillset_gap,
  } = result;

  const scoreColor =
    readiness_score >= 80
      ? 'text-emerald-500 dark:text-emerald-400'
      : readiness_score >= 60
        ? 'text-amber-500 dark:text-amber-400'
        : 'text-rose-500 dark:text-rose-400';

  const scoreBg =
    readiness_score >= 80
      ? 'bg-emerald-500/10 border-emerald-500/25'
      : readiness_score >= 60
        ? 'bg-amber-500/10 border-amber-500/25'
        : 'bg-rose-500/10 border-rose-500/25';

  const formattedDate = new Date(created_at).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate top 3 priority gaps
  const topGaps = [...skillset_gap]
    .filter((row) => row.gap)
    .sort((a, b) => b.gap_amount - a.gap_amount)
    .slice(0, 3);

  const totalRequired = skillset_gap.reduce((acc, r) => acc + r.required_level, 0);
  const totalAttainment = skillset_gap.reduce((acc, r) => acc + r.attainment, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="border border-border/80 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-heading text-foreground">
                Target Company Readiness: {company_name}
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono font-normal">
                {scoring_version}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Assessment evaluated on {formattedDate}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs h-8 print:hidden"
            >
              <Printer className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Print Report</span>
            </Button>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1.5 border border-primary/20">
              <Award className="w-3.5 h-3.5" /> Deterministic Rubric Match
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Top metrics summary grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Score Box */}
          <div
            className={`p-4 rounded-xl border ${scoreBg} flex flex-col justify-between transition-all relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Readiness Score
              </span>
              <Sparkles className={`w-4 h-4 ${scoreColor}`} />
            </div>
            <div className="my-2 flex items-baseline gap-1">
              <span className={`text-5xl font-extrabold font-heading tracking-tight ${scoreColor}`}>
                {readiness_score}
              </span>
              <span className="text-sm font-medium text-muted-foreground"> / 100</span>
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>{totalAttainment} of {totalRequired} points</span>
              <span className="font-semibold text-foreground">
                {Math.round((totalAttainment / totalRequired) * 100)}%
              </span>
            </div>
          </div>

          {/* Gaps Found Box */}
          <div className="p-4 rounded-xl border border-border/60 bg-background/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories With Gaps
              </span>
              {summary.categories_with_gap === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-heading text-foreground">
                {summary.categories_with_gap}
              </span>
              <span className="text-sm font-medium text-muted-foreground"> / 12 Categories</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {12 - summary.categories_with_gap} categories meet or exceed expectations
            </p>
          </div>

          {/* Assessment Coverage Box */}
          <div className="p-4 rounded-xl border border-border/60 bg-background/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assessment Coverage
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-heading text-foreground">
                {(assessment_coverage * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              All 12 RADIX categories self-assessed (Complete)
            </p>
          </div>

          {/* Evidence Coverage Box (Informational) */}
          <div className="p-4 rounded-xl border border-border/60 bg-background/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Profile Evidence Support
              </span>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-bold font-heading text-foreground">
                {(evidence_coverage * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1.5 font-normal">
                ({summary.categories_with_profile_evidence}/12)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Source-backed in CV / projects (Informational metric)
            </p>
          </div>
        </div>

        {/* Priority Gaps Action Plan Strip */}
        {topGaps.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-500" /> Highest Priority Action Items
              </span>
              <span className="text-xs text-muted-foreground">
                Focus on these 3 areas to achieve the fastest score improvement
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {topGaps.map((row) => {
                const meta = CATEGORY_METADATA[row.category_code];
                return (
                  <div
                    key={row.category_code}
                    className="p-3 rounded-lg bg-background border border-amber-500/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {row.category_code}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs"
                        >
                          Gap: -{row.gap_amount}
                        </Badge>
                      </div>
                      <h5 className="font-heading font-semibold text-xs mt-2 text-foreground truncate">
                        {meta.name}
                      </h5>
                    </div>
                    <div className="mt-3 text-[11px] text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40">
                      <span>Current: Level {row.candidate_level}</span>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        Target: Level {row.required_level} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strongest Categories Section */}
        {summary.strongest_categories.length > 0 && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Strongest Competencies (Exceeding / Highest Attainment)
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.strongest_categories.map((code) => {
                const meta = CATEGORY_METADATA[code];
                return (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="px-2.5 py-1 text-xs font-medium border border-border/60 bg-background/80"
                  >
                    <span className="font-mono font-bold mr-1.5 text-primary">{code}</span>
                    {meta?.name || code}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Canonical Interpretation Disclaimer Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-blue-950 dark:text-blue-100">
              Evaluation Methodology & Notice
            </span>
            <p className="leading-relaxed opacity-90">{summary.interpretation_notice}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
