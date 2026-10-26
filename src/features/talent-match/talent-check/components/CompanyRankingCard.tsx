import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompanyKey, TARGET_COMPANIES } from '../types';
import { Trophy, Building2, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export interface CompanyRankItem {
  companyKey: CompanyKey;
  companyName: string;
  readinessScore: number;
  categoriesWithGap: number;
  totalAttainment: number;
  totalRequired: number;
}

interface CompanyRankingCardProps {
  rankings: CompanyRankItem[];
  activeCompanyKey: CompanyKey;
  onSelectCompany: (companyKey: CompanyKey) => void;
  isLoading?: boolean;
  error?: string | null;
}

const RANK_BADGES = [
  { label: '#1 Best Fit', badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold', icon: Trophy },
  { label: '#2 Fit', badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-semibold', icon: Building2 },
  { label: '#3 Fit', badgeClass: 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30 font-semibold', icon: Building2 },
];

export const CompanyRankingCard: React.FC<CompanyRankingCardProps> = ({
  rankings,
  activeCompanyKey,
  onSelectCompany,
  isLoading = false,
  error = null,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-xs" data-testid="company-ranking-loading">
        <CardHeader className="pb-3">
          <div className="h-5 w-52 bg-muted animate-pulse rounded" />
          <div className="h-3 w-80 bg-muted/70 animate-pulse rounded mt-1.5" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl border border-border/50 bg-muted/20 animate-pulse p-4" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border border-destructive/30 bg-destructive/5 shadow-xs" data-testid="company-ranking-error">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-1.5 text-destructive">
            <AlertCircle className="w-4 h-4" /> Best-Fit Ranking Unavailable
          </CardTitle>
          <CardDescription className="text-xs text-destructive/80">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Empty state
  if (!rankings || rankings.length === 0) {
    return (
      <Card className="border border-border/60 bg-card shadow-xs" data-testid="company-ranking-empty">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> Best-Fit Company Ranking
          </CardTitle>
          <CardDescription className="text-xs">
            Side-by-side readiness evaluation comparing Google, Microsoft, and Oracle FSS.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-28 flex items-center justify-center text-center p-4">
          <p className="text-xs text-muted-foreground">
            Run Talent Check or load preview data to see side-by-side best-fit ranking.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort rankings highest readiness score first (tc-v1)
  const sortedRankings = [...rankings].sort((a, b) => {
    if (b.readinessScore !== a.readinessScore) {
      return b.readinessScore - a.readinessScore;
    }
    // Tie-breaker 1: Fewer categories with gap
    if (a.categoriesWithGap !== b.categoriesWithGap) {
      return a.categoriesWithGap - b.categoriesWithGap;
    }
    // Tie-breaker 2: Alphabetical
    return a.companyName.localeCompare(b.companyName);
  });

  return (
    <Card className="border border-border/60 bg-card shadow-xs" data-testid="company-ranking-card">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-heading flex items-center gap-2 text-foreground">
              <Trophy className="w-4 h-4 text-amber-500" /> Best-Fit Company Ranking (tc-v1)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Candidate profile evaluated against all three target company rubrics, ordered from highest to lowest match.
            </CardDescription>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto bg-primary/10 text-primary border-primary/20 text-xs">
            3 Target Companies Evaluated
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          role="region"
          aria-label="Best-fit company ranking sorted from highest to lowest readiness score"
        >
          {sortedRankings.map((rankItem, index) => {
            const rankMeta = RANK_BADGES[index] || RANK_BADGES[2];
            const RankIcon = rankMeta.icon;
            const isSelected = rankItem.companyKey === activeCompanyKey;
            const companyInfo = TARGET_COMPANIES.find((c) => c.key === rankItem.companyKey);

            // Dynamic color logic based on score threshold
            const scoreColor =
              rankItem.readinessScore >= 80
                ? 'text-emerald-600 dark:text-emerald-400'
                : rankItem.readinessScore >= 60
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400';

            const bgGlow =
              rankItem.readinessScore >= 80
                ? 'border-emerald-500/30'
                : rankItem.readinessScore >= 60
                  ? 'border-amber-500/30'
                  : 'border-rose-500/30';

            return (
              <div
                key={rankItem.companyKey}
                data-testid={`rank-card-${rankItem.companyKey}`}
                className={`relative rounded-xl border p-4.5 flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03] shadow-sm'
                    : 'border-border/70 hover:border-border bg-card'
                }`}
              >
                <div>
                  {/* Top Bar: Rank Badge + Selected indicator */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <Badge variant="outline" className={`text-xs gap-1 py-0.5 ${rankMeta.badgeClass}`}>
                      <RankIcon className="w-3 h-3" />
                      <span>{rankMeta.label}</span>
                    </Badge>

                    {isSelected && (
                      <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> Active View
                      </span>
                    )}
                  </div>

                  {/* Company Name & Score */}
                  <div className="mt-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground">
                        {rankItem.companyName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {companyInfo?.description}
                      </p>
                    </div>
                  </div>

                  {/* Large Score Metric */}
                  <div className="my-3.5 flex items-baseline gap-2">
                    <span className={`text-3xl font-extrabold font-heading ${scoreColor}`}>
                      {rankItem.readinessScore}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">/ 100 Readiness</span>
                  </div>

                  {/* Attainment progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Attainment:</span>
                      <span className="font-medium text-foreground">
                        {rankItem.totalAttainment} / {rankItem.totalRequired} pts
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rankItem.readinessScore >= 80
                            ? 'bg-emerald-500'
                            : rankItem.readinessScore >= 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((rankItem.totalAttainment / rankItem.totalRequired) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats list */}
                  <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      {rankItem.categoriesWithGap === 0 ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> All 12 Met
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span>{rankItem.categoriesWithGap} Gaps</span>
                        </>
                      )}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {12 - rankItem.categoriesWithGap} Met/Surplus
                    </span>
                  </div>
                </div>

                {/* Inspect Action Button */}
                <div className="mt-4 pt-2">
                  <Button
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="w-full text-xs font-medium justify-center gap-1"
                    onClick={() => onSelectCompany(rankItem.companyKey)}
                  >
                    {isSelected ? (
                      <>
                        <span>Inspecting Breakdown</span>
                      </>
                    ) : (
                      <>
                        <span>View Breakdown</span>
                        <ArrowRight className="w-3 h-3 ml-0.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
