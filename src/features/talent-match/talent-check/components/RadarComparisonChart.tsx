import React, { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryGapItem, CATEGORY_METADATA } from '../types';
import { Compass, Eye, CheckCircle2, AlertTriangle, Sparkles, AlertCircle } from 'lucide-react';

// Fallback for environments where ResizeObserver is not natively defined
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

interface RadarComparisonChartProps {
  items: CategoryGapItem[];
  companyName: string;
  isLoading?: boolean;
  error?: string | null;
}

type ViewMode = 'both' | 'candidate' | 'required';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: {
      category_code: string;
      category_name: string;
      required_level: number;
      candidate_level: number;
      gap_amount: number;
      attainment: number;
      gap: boolean;
    };
  }>;
}

const CustomRadarTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const surplus = data.candidate_level - data.required_level;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border/80 shadow-lg rounded-lg p-3 text-xs space-y-1.5 min-w-[200px]">
      <div className="flex items-center justify-between pb-1 border-b border-border/50">
        <span className="font-mono font-bold text-primary">{data.category_code}</span>
        <span className="font-semibold text-foreground text-[11px] truncate max-w-[130px]">
          {data.category_name}
        </span>
      </div>
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Candidate Level:
          </span>
          <span className="font-bold text-foreground">{data.candidate_level} / 10</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Target Requirement:
          </span>
          <span className="font-bold text-foreground">{data.required_level} / 10</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <span className="text-muted-foreground">Attainment:</span>
          <span className="font-bold text-foreground">{data.attainment} / 10</span>
        </div>
        <div className="pt-0.5">
          {surplus > 0 ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] w-full justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Surplus (+{surplus})
            </Badge>
          ) : !data.gap ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] w-full justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Requirement Met
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] w-full justify-center">
              <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Gap (-{data.gap_amount})
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export const RadarComparisonChart: React.FC<RadarComparisonChartProps> = ({
  items,
  companyName,
  isLoading = false,
  error = null,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  // Loading state
  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-xs" data-testid="radar-loading-state">
        <CardHeader className="pb-2">
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          <div className="h-3 w-72 bg-muted/70 animate-pulse rounded mt-1.5" />
        </CardHeader>
        <CardContent className="h-[360px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <Compass className="w-8 h-8 text-primary animate-spin mx-auto opacity-70" />
            <p className="text-xs text-muted-foreground">Rendering 12-axis competency polygon...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border border-destructive/30 bg-destructive/5 shadow-xs" data-testid="radar-error-state">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-1.5 text-destructive">
            <AlertCircle className="w-4 h-4" /> Radar Visualization Error
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
      <Card className="border border-border/60 bg-card shadow-xs" data-testid="radar-empty-state">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" /> 12-Axis Skillset Radar Comparison
          </CardTitle>
          <CardDescription className="text-xs">
            Visual overlay of your self-assessed levels against target company requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] flex items-center justify-center text-center p-6">
          <div className="max-w-sm space-y-2">
            <Compass className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h4 className="text-sm font-semibold text-foreground">No Assessment Data Yet</h4>
            <p className="text-xs text-muted-foreground">
              Select a target company and click &quot;Run Talent Check&quot; or &quot;Load Preview Data&quot; to visualize the 12 RADIX competency axes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for 12 recharts axes
  const chartData = items.map((item) => {
    const meta = CATEGORY_METADATA[item.category_code];
    return {
      category_code: item.category_code,
      category_name: meta?.name || item.category_code,
      required_level: item.required_level,
      candidate_level: item.candidate_level,
      attainment: item.attainment,
      gap_amount: item.gap_amount,
      gap: item.gap,
    };
  });

  return (
    <Card className="border border-border/60 bg-card shadow-xs" data-testid="radar-comparison-chart">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40">
        <div>
          <CardTitle className="text-base font-heading flex items-center gap-2 text-foreground">
            <Compass className="w-4 h-4 text-primary" /> 12-Axis Competency Radar Comparison
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Visual profile polygon comparing candidate levels against {companyName}&apos;s required benchmarks (1–10).
          </CardDescription>
        </div>

        {/* View toggle controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/40 p-1 rounded-lg border border-border/50 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground px-1.5 flex items-center gap-1">
            <Eye className="w-3 h-3" /> View:
          </span>
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              viewMode === 'both'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Both
          </button>
          <button
            type="button"
            onClick={() => setViewMode('candidate')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              viewMode === 'candidate'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Candidate
          </button>
          <button
            type="button"
            onClick={() => setViewMode('required')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              viewMode === 'required'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Required
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {/* Screen reader summary */}
        <div className="sr-only">
          <p>
            12-axis radar comparison for {companyName}. Evaluates Coding, DSA, OOD, Aptitude, Communication,
            AI, Cloud, SQL, SWE, System Design, Networking, and OS on a scale from 1 to 10.
          </p>
        </div>

        <div className="h-[360px] sm:h-[400px] w-full" aria-label={`12-axis radar chart for ${companyName}`}>
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="currentColor" className="text-border/60" />
              <PolarAngleAxis
                dataKey="category_code"
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                className="text-foreground font-mono"
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tickCount={6}
                tick={{ fill: 'currentColor', fontSize: 9 }}
                className="text-muted-foreground"
              />

              {/* Company Required Polygon */}
              {(viewMode === 'both' || viewMode === 'required') && (
                <Radar
                  name={`${companyName} Required`}
                  dataKey="required_level"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
              )}

              {/* Candidate Polygon */}
              {(viewMode === 'both' || viewMode === 'candidate') && (
                <Radar
                  name="Candidate Level"
                  dataKey="candidate_level"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.28}
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              )}

              <Tooltip content={<CustomRadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend strip */}
        <div className="mt-2 pt-3 border-t border-border/40 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500" />
            <span className="text-foreground font-medium">Candidate Self-Assessed Level</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500 border-dashed" />
            <span className="text-foreground font-medium">{companyName} Requirement (1–10)</span>
          </div>
          <div className="text-muted-foreground text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> Hover over any point to view exact attainment & gap
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
