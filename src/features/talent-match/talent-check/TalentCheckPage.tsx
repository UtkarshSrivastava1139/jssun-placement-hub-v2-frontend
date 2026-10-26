import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadinessScoreCard } from "./components/ReadinessScoreCard";
import { CategoryGapTable } from "./components/CategoryGapTable";
import { RadarComparisonChart } from "./components/RadarComparisonChart";
import { CompanyRankingCard, CompanyRankItem } from "./components/CompanyRankingCard";
import { WhatIfSimulator } from "./components/WhatIfSimulator";
import {
  CategoryGapItem,
  CompanyKey,
  RadixCategoryCode,
  TARGET_COMPANIES,
  TalentCheckResult,
} from "./types";
import { ensureTalentMatchSession } from "../auth/talentMatchSupabaseClient";
import { talentMatchRequest } from "../api/client";
import { TalentMatchHttpError } from "../api/client";
import { mapTalentMatchError } from "../api/errorMessages";
import { ErrorState } from "../components/ErrorState";
import { CategoryCompletionChecklist } from "../components/CategoryCompletionChecklist";
import { SampleDataBanner } from "../components/SampleDataBanner";
import {
  Building2,
  CheckCircle2,
  Compass,
  Play,
  RotateCcw,
  Loader2,
  Sparkles,
  BarChart3,
} from "lucide-react";

const CANDIDATE_PROFILE_LEVELS: Record<RadixCategoryCode, number> = {
  COD: 6,
  DSA: 8,
  OOD: 5,
  APTI: 6,
  COMM: 7,
  AI: 4,
  CLOUD: 5,
  SQL: 5,
  SWE: 4,
  SYSD: 5,
  NETW: 5,
  OS: 3,
};

const COMPANY_PREVIEW_REQUIREMENTS: Record<CompanyKey, Record<RadixCategoryCode, number>> = {
  google: {
    COD: 8,
    DSA: 7,
    OOD: 6,
    APTI: 5,
    COMM: 6,
    AI: 4,
    CLOUD: 5,
    SQL: 7,
    SWE: 5,
    SYSD: 6,
    NETW: 5,
    OS: 4,
  },
  microsoft: {
    COD: 6,
    DSA: 6,
    OOD: 6,
    APTI: 6,
    COMM: 7,
    AI: 5,
    CLOUD: 8,
    SQL: 6,
    SWE: 8,
    SYSD: 7,
    NETW: 5,
    OS: 5,
  },
  oracle_fss: {
    COD: 7,
    DSA: 5,
    OOD: 5,
    APTI: 6,
    COMM: 6,
    AI: 4,
    CLOUD: 6,
    SQL: 9,
    SWE: 6,
    SYSD: 7,
    NETW: 6,
    OS: 4,
  },
};

const SOURCE_SUPPORTED_CATEGORIES: Set<RadixCategoryCode> = new Set([
  "COD",
  "DSA",
  "CLOUD",
  "SQL",
  "SWE",
]);

function computeSyntheticResult(companyKey: CompanyKey): TalentCheckResult {
  const reqs = COMPANY_PREVIEW_REQUIREMENTS[companyKey];
  const companyMeta = TARGET_COMPANIES.find((c) => c.key === companyKey)!;

  let totalAttainment = 0;
  let totalRequired = 0;
  const gapRows: CategoryGapItem[] = [];
  const surplusCategories: RadixCategoryCode[] = [];
  const meetingCategories: { code: RadixCategoryCode; level: number }[] = [];

  const categories: RadixCategoryCode[] = [
    "COD",
    "DSA",
    "OOD",
    "APTI",
    "COMM",
    "AI",
    "CLOUD",
    "SQL",
    "SWE",
    "SYSD",
    "NETW",
    "OS",
  ];

  for (const code of categories) {
    const r_i = reqs[code];
    const c_i = CANDIDATE_PROFILE_LEVELS[code];
    const attainment_i = Math.min(c_i, r_i);
    const gap_amount_i = Math.max(r_i - c_i, 0);
    const gap_i = gap_amount_i > 0;

    totalAttainment += attainment_i;
    totalRequired += r_i;

    const isSupported = SOURCE_SUPPORTED_CATEGORIES.has(code);

    gapRows.push({
      category_code: code,
      required_level: r_i,
      candidate_level: c_i,
      gap_amount: gap_amount_i,
      gap: gap_i,
      attainment: attainment_i,
      learning_topics: [],
      profile_evidence_status: isSupported ? "source_supported" : "self_report_only",
    });

    if (c_i > r_i) {
      surplusCategories.push(code);
    } else if (!gap_i) {
      meetingCategories.push({ code, level: c_i });
    }
  }

  const readiness_score = Math.floor((100.0 * totalAttainment) / totalRequired + 0.5);

  let strongest: RadixCategoryCode[];
  if (surplusCategories.length > 0) {
    strongest = surplusCategories.sort();
  } else {
    strongest = meetingCategories
      .sort((a, b) => b.level - a.level || a.code.localeCompare(b.code))
      .map((m) => m.code);
  }

  const categories_with_gap = gapRows.filter((r) => r.gap).length;
  const categories_with_profile_evidence = SOURCE_SUPPORTED_CATEGORIES.size;
  const evidence_coverage = Math.round((categories_with_profile_evidence / 12.0) * 10000) / 10000;

  return {
    schema_version: "1.0.0",
    assessment_id: "d6c294b0-1af5-49db-8c01-c8d16c949301",
    profile_id: "3ef0f3a8-47af-4d8f-92ed-7b46bbaf0970",
    company_key: companyKey,
    company_name: companyMeta.name,
    readiness_score,
    scoring_version: "tc-v1",
    created_at: new Date().toISOString(),
    skillset_gap: gapRows,
    assessment_coverage: 1.0,
    evidence_coverage,
    summary: {
      categories_with_gap,
      strongest_categories: strongest,
      interpretation_notice:
        "This readiness score evaluates candidate self-reported category levels against the supplied company rubric (scoring version tc-v1). It is an explainable rubric comparison, not a hiring probability, verified competence score, or guarantee of selection.",
      categories_with_profile_evidence,
    },
  };
}

export const TalentCheckPage: React.FC = () => {
  const [selectedCompanyKey, setSelectedCompanyKey] = useState<CompanyKey>("google");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TalentCheckResult | null>(null);
  const [rankings, setRankings] = useState<CompanyRankItem[] | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [missingCategoryCodes, setMissingCategoryCodes] = useState<string[]>([]);

  const selectedCompany = TARGET_COMPANIES.find((c) => c.key === selectedCompanyKey)!;

  const handleCompanyChange = (key: CompanyKey) => {
    setSelectedCompanyKey(key);
    setError(null);
    setMissingCategoryCodes([]);
    if (result && isDemoMode) {
      setResult(computeSyntheticResult(key));
    }
  };

  // Uses the shared Talent Match client: one session, one API base URL, one error model.
  async function callTalentCheckApi(companyKey: CompanyKey): Promise<TalentCheckResult> {
    await ensureTalentMatchSession();
    return talentMatchRequest<TalentCheckResult>("/api/v1/talent-check", {
      method: "POST",
      body: JSON.stringify({ company_key: companyKey }),
    });
  }

  const handleRunCheck = async () => {
    setLoading(true);
    setError(null);
    setIsDemoMode(false);

    try {
      const data = await callTalentCheckApi(selectedCompanyKey);
      setResult(data);

      // Concurrently query rankings for all target companies
      try {
        const allKeys: CompanyKey[] = ["google", "microsoft", "oracle_fss"];
        const rankResponses = await Promise.all(
          allKeys.map(async (key): Promise<TalentCheckResult | null> => {
            if (key === selectedCompanyKey) return data;
            try {
              return await callTalentCheckApi(key);
            } catch {
              return null;
            }
          }),
        );

        const rankItems: CompanyRankItem[] = rankResponses
          .filter((r): r is TalentCheckResult => r !== null)
          .map((r) => ({
            companyKey: r.company_key,
            companyName: r.company_name,
            readinessScore: r.readiness_score,
            categoriesWithGap: r.summary.categories_with_gap,
            totalAttainment: r.skillset_gap.reduce((sum, item) => sum + item.attainment, 0),
            totalRequired: r.skillset_gap.reduce((sum, item) => sum + item.required_level, 0),
          }));

        if (rankItems.length > 0) {
          setRankings(rankItems);
        }
      } catch {
        // If secondary rankings fail, keep active result
      }
    } catch (err: unknown) {
      if (err instanceof TalentMatchHttpError && err.code === "INCOMPLETE_CANDIDATE_PROFILE") {
        const detail = err.details?.find((item) => Array.isArray(item["missing_category_codes"]));
        const codes = detail?.["missing_category_codes"];
        setMissingCategoryCodes(
          Array.isArray(codes)
            ? codes.filter((code): code is string => typeof code === "string")
            : [],
        );
      }
      const message =
        err instanceof TalentMatchHttpError
          ? mapTalentMatchError(err).message
          : "Talent Match could not complete that request. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoPreview = () => {
    setError(null);
    const activeRes = computeSyntheticResult(selectedCompanyKey);
    setResult(activeRes);
    setIsDemoMode(true);

    const allKeys: CompanyKey[] = ["google", "microsoft", "oracle_fss"];
    const rankItems: CompanyRankItem[] = allKeys.map((k) => {
      const r = computeSyntheticResult(k);
      return {
        companyKey: k,
        companyName: r.company_name,
        readinessScore: r.readiness_score,
        categoriesWithGap: r.summary.categories_with_gap,
        totalAttainment: r.skillset_gap.reduce((sum, item) => sum + item.attainment, 0),
        totalRequired: r.skillset_gap.reduce((sum, item) => sum + item.required_level, 0),
      };
    });
    setRankings(rankItems);
    setLoading(false);
  };

  const handleSelectCompanyFromRanking = (companyKey: CompanyKey) => {
    setSelectedCompanyKey(companyKey);
    if (isDemoMode) {
      setResult(computeSyntheticResult(companyKey));
    }
  };

  const handleReset = () => {
    setResult(null);
    setRankings(null);
    setError(null);
    setIsDemoMode(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            RADIX Step 4
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            tc-v1 deterministic rubric
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
          Company Talent Check
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
          Evaluate your profile readiness against target company rubric expectations across all 12
          RADIX skill categories. Every calculation is pure, deterministic, and explainable.
        </p>
      </div>

      {/* Target Company Selection & Trigger Card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Select Target Company
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Click a company to switch evaluation
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Choose one of the three verified hackathon companies to benchmark your 12-category
            proficiency against.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TARGET_COMPANIES.map((company) => {
              const isSelected = selectedCompanyKey === company.key;
              return (
                <button
                  type="button"
                  key={company.key}
                  onClick={() => handleCompanyChange(company.key)}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                      : "border-border/60 bg-background/50 hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-heading font-semibold text-sm text-foreground">
                      {company.name}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {company.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Compass className="w-4 h-4 text-primary" />
              <span>
                Targeting: <strong>{selectedCompany.name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5 text-xs h-8"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset View
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadDemoPreview}
                disabled={loading}
                className="gap-1.5 text-xs text-muted-foreground h-8"
              >
                Load Preview Data
              </Button>
              <Button
                onClick={handleRunCheck}
                disabled={loading}
                className="gap-2 font-medium text-xs sm:text-sm px-5 h-8 sm:h-9"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Rubric...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Run Talent Check
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error / Alert Display */}
      {error && (
        <ErrorState
          title="Assessment Evaluation Blocked"
          message={error}
          actionLabel="Try with Synthetic Preview Data"
          onAction={handleLoadDemoPreview}
        />
      )}
      <CategoryCompletionChecklist
        title="Profile categories for Talent Check"
        missingCodes={missingCategoryCodes}
      />

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <SampleDataBanner detail="This preview uses a validated acceptance fixture. Switching companies updates the breakdown." />
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Card */}
          <ReadinessScoreCard result={result} />

          {/* 12-Category Table */}
          <CategoryGapTable items={result.skillset_gap} companyName={result.company_name} />

          {/* 12-Axis Radar Comparison Chart */}
          <RadarComparisonChart
            items={result.skillset_gap}
            companyName={result.company_name}
            isLoading={loading}
          />

          {/* Best-Fit Company Ranking */}
          {rankings && rankings.length > 0 && (
            <CompanyRankingCard
              rankings={rankings}
              activeCompanyKey={selectedCompanyKey}
              onSelectCompany={handleSelectCompanyFromRanking}
              isLoading={loading}
            />
          )}

          {/* What-If Live Simulator */}
          <WhatIfSimulator
            items={result.skillset_gap}
            companyName={result.company_name}
            baselineScore={result.readiness_score}
            isLoading={loading}
          />
        </div>
      )}

      {/* Empty / Initial State Placeholder */}
      {!result && !loading && !error && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/30 space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-foreground text-base">
            No Evaluation Performed Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Select one of the target companies above and click &quot;Run Talent Check&quot; to
            compute your explainable readiness score across all 12 RADIX skill categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default TalentCheckPage;
