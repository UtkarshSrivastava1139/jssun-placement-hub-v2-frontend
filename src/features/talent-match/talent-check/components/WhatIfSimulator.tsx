import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CategoryGapItem, CATEGORY_METADATA, RadixCategoryCode } from '../types';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  AlertCircle,
} from 'lucide-react';

interface WhatIfSimulatorProps {
  items: CategoryGapItem[];
  companyName: string;
  baselineScore: number;
  isLoading?: boolean;
  error?: string | null;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  items,
  companyName,
  baselineScore,
  isLoading = false,
  error = null,
}) => {
  // Initialize simulated candidate levels from current baseline
  const [simulatedLevels, setSimulatedLevels] = useState<Record<RadixCategoryCode, number>>(() => {
    const initial: Partial<Record<RadixCategoryCode, number>> = {};
    for (const item of items) {
      initial[item.category_code] = item.candidate_level;
    }
    return initial as Record<RadixCategoryCode, number>;
  });

  // Keep in sync if items change
  useEffect(() => {
    const next: Partial<Record<RadixCategoryCode, number>> = {};
    for (const item of items) {
      next[item.category_code] = item.candidate_level;
    }
    setSimulatedLevels(next as Record<RadixCategoryCode, number>);
  }, [items]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-xs" data-testid="what-if-loading">
        <CardHeader className="pb-3">
          <div className="h-5 w-52 bg-muted animate-pulse rounded" />
          <div className="h-3 w-80 bg-muted/70 animate-pulse rounded mt-1.5" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Sliders className="w-8 h-8 text-primary animate-pulse opacity-70" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border border-destructive/30 bg-destructive/5 shadow-xs" data-testid="what-if-error">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-1.5 text-destructive">
            <AlertCircle className="w-4 h-4" /> Simulator Unavailable
          </CardTitle>
          <CardDescription className="text-xs text-destructive/80">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <Card className="border border-border/60 bg-card shadow-xs" data-testid="what-if-empty">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" /> What-If Readiness Simulator
          </CardTitle>
          <CardDescription className="text-xs">
            Interactive sandbox to simulate candidate level improvements and see real-time score impacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-28 flex items-center justify-center text-center p-4">
          <p className="text-xs text-muted-foreground">
            Run Talent Check or load preview data to unlock the interactive what-if simulator.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Exact canonical tc-v1 live calculation: floor(100 * sum(min(C_i, R_i)) / sum(R_i) + 0.5)
  let simulatedAttainmentSum = 0;
  let totalRequiredSum = 0;
  let simulatedGapsCount = 0;

  for (const item of items) {
    const r_i = item.required_level;
    const c_i = simulatedLevels[item.category_code] ?? item.candidate_level;
    const attainment_i = Math.min(c_i, r_i);

    simulatedAttainmentSum += attainment_i;
    totalRequiredSum += r_i;

    if (c_i < r_i) {
      simulatedGapsCount += 1;
    }
  }

  const simulatedScore =
    totalRequiredSum > 0
      ? Math.floor((100.0 * simulatedAttainmentSum) / totalRequiredSum + 0.5)
      : baselineScore;

  const scoreDelta = simulatedScore - baselineScore;

  // Handle single category slider adjustment
  const handleSliderChange = (code: RadixCategoryCode, value: number[]) => {
    const val = value[0];
    if (val >= 1 && val <= 10) {
      setSimulatedLevels((prev) => ({
        ...prev,
        [code]: val,
      }));
    }
  };

  // Reset to original candidate profile levels
  const handleResetToBaseline = () => {
    const resetVals: Partial<Record<RadixCategoryCode, number>> = {};
    for (const item of items) {
      resetVals[item.category_code] = item.candidate_level;
    }
    setSimulatedLevels(resetVals as Record<RadixCategoryCode, number>);
  };

  // Check if any level differs from baseline
  const isModified = items.some(
    (item) => (simulatedLevels[item.category_code] ?? item.candidate_level) !== item.candidate_level
  );

  return (
    <Card className="border border-border/60 bg-card shadow-xs" data-testid="what-if-simulator">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-heading flex items-center gap-2 text-foreground">
                <Sliders className="w-4 h-4 text-primary" /> What-If Readiness Simulator (Client-Side)
              </CardTitle>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-mono">
                SIMULATION ONLY
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Drag the sliders below to explore how skill level gains would impact your {companyName} readiness score.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {isModified && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToBaseline}
                className="text-xs h-7 gap-1 border-border/60 hover:bg-muted"
                data-testid="what-if-reset-btn"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Baseline</span>
              </Button>
            )}
          </div>
        </div>

        {/* Clear Non-Destructive Simulation Disclaimer */}
        <div className="mt-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50 flex items-start gap-2 text-[11px] text-muted-foreground">
          <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Simulation Notice:</strong> All recalculations are executed purely client-side using the canonical <code className="font-mono text-primary">tc-v1</code> formula. These values are never saved and do not modify your verified candidate profile.
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Live Score Comparison Banner */}
        <div className="p-4 rounded-xl bg-background border border-border/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full sm:w-auto justify-around sm:justify-start">
            {/* Baseline Score */}
            <div className="text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Baseline Score
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold font-heading text-muted-foreground">
                  {baselineScore}
                </span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="text-muted-foreground font-mono font-bold text-lg">→</div>

            {/* Simulated Score */}
            <div className="text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> Simulated Score
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-3xl font-extrabold font-heading ${
                  simulatedScore >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : simulatedScore >= 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {simulatedScore}
                </span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
          </div>

          {/* Delta Pill */}
          <div className="flex items-center gap-2">
            {scoreDelta > 0 ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 font-semibold gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{scoreDelta} pts improvement</span>
              </Badge>
            ) : scoreDelta < 0 ? (
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-xs px-3 py-1 font-semibold gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{scoreDelta} pts change</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted text-muted-foreground border-border/60 text-xs px-3 py-1 font-medium">
                Baseline match (No delta)
              </Badge>
            )}

            <span className="text-xs text-muted-foreground hidden sm:inline">
              ({simulatedGapsCount} gaps remaining)
            </span>
          </div>
        </div>

        {/* 12 Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5" role="group" aria-label="12 RADIX Category Level Sliders">
          {items.map((item) => {
            const code = item.category_code;
            const meta = CATEGORY_METADATA[code];
            const currentSimLevel = simulatedLevels[code] ?? item.candidate_level;
            const req = item.required_level;
            const baseline = item.candidate_level;
            const isChanged = currentSimLevel !== baseline;
            const gapAmount = Math.max(req - currentSimLevel, 0);
            const isMet = currentSimLevel >= req;
            const isSurplus = currentSimLevel > req;

            return (
              <div
                key={code}
                data-testid={`slider-box-${code}`}
                className={`p-3.5 rounded-xl border transition-all duration-150 ${
                  isChanged
                    ? 'border-primary/40 bg-primary/[0.02] shadow-2xs'
                    : 'border-border/60 bg-card/60'
                }`}
              >
                {/* Header row: Code, name & target */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {code}
                    </span>
                    <span className="font-semibold text-xs text-foreground truncate max-w-[130px]" title={meta?.name}>
                      {meta?.name}
                    </span>
                  </div>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    Req: <strong className="text-foreground">{req}</strong>
                  </span>
                </div>

                {/* Level Display & Status Badge */}
                <div className="mt-2.5 mb-2 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground">Level:</span>
                    <span className="font-bold font-mono text-sm text-foreground">
                      {currentSimLevel}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/ 10</span>
                    {isChanged && (
                      <span className="text-[10px] font-mono font-semibold text-primary ml-1">
                        ({currentSimLevel > baseline ? `+${currentSimLevel - baseline}` : currentSimLevel - baseline})
                      </span>
                    )}
                  </div>

                  {/* Status indicator */}
                  {isSurplus ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5">
                      Surplus (+{currentSimLevel - req})
                    </Badge>
                  ) : isMet ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5">
                      Met Level
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] py-0 px-1.5">
                      Gap (-{gapAmount})
                    </Badge>
                  )}
                </div>

                {/* Accessible Slider control */}
                <div className="pt-1">
                  <Slider
                    value={[currentSimLevel]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(val) => handleSliderChange(code, val)}
                    aria-label={`Simulate candidate level for ${meta?.name || code}`}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    aria-valuenow={currentSimLevel}
                    className="cursor-pointer"
                  />
                </div>

                {/* Track ticks helper */}
                <div className="flex justify-between text-[9px] text-muted-foreground font-mono px-0.5 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
