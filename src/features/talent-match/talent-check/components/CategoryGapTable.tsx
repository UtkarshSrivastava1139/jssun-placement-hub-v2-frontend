import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_METADATA, CategoryGapItem, RadixCategoryCode } from "../types";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  HelpCircle,
  FileCheck,
  User,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CategoryGapTableProps {
  items: CategoryGapItem[];
  companyName: string;
}

type FilterMode = "all" | "gaps" | "met" | "supported";
type SortMode = "default" | "largest-gap" | "highest-req" | "highest-cand";

export const CategoryGapTable: React.FC<CategoryGapTableProps> = ({ items, companyName }) => {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<Set<RadixCategoryCode>>(new Set());

  const toggleExpand = (code: RadixCategoryCode) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const counts = useMemo(() => {
    const gaps = items.filter((i) => i.gap).length;
    const met = items.filter((i) => !i.gap).length;
    const supported = items.filter((i) => i.profile_evidence_status === "source_supported").length;
    return { all: items.length, gaps, met, supported };
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const meta = CATEGORY_METADATA[item.category_code];
        return (
          item.category_code.toLowerCase().includes(q) ||
          meta.name.toLowerCase().includes(q) ||
          meta.description.toLowerCase().includes(q)
        );
      });
    }

    // Tab filter
    if (filterMode === "gaps") {
      result = result.filter((i) => i.gap);
    } else if (filterMode === "met") {
      result = result.filter((i) => !i.gap);
    } else if (filterMode === "supported") {
      result = result.filter((i) => i.profile_evidence_status === "source_supported");
    }

    // Sort
    if (sortMode === "largest-gap") {
      result.sort((a, b) => b.gap_amount - a.gap_amount);
    } else if (sortMode === "highest-req") {
      result.sort((a, b) => b.required_level - a.required_level);
    } else if (sortMode === "highest-cand") {
      result.sort((a, b) => b.candidate_level - a.candidate_level);
    }

    return result;
  }, [items, searchQuery, filterMode, sortMode]);

  return (
    <Card className="border border-border/80 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-heading text-foreground flex items-center gap-2">
              <span>Skillset Gap Analysis</span>
              <Badge variant="outline" className="text-xs font-mono font-normal">
                {items.length} Categories
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Comparison between {companyName}&apos;s required level and your self-assessed
              proficiency.
            </CardDescription>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/60">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("gaps")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "gaps"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Gaps to Address ({counts.gaps})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("met")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "met"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Met & Surplus ({counts.met})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("supported")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "supported"
                  ? "bg-primary/15 text-primary shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Source-Supported ({counts.supported})
            </button>
          </div>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 mt-1 border-t border-border/30">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by keyword (e.g. SQL, Cloud)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 h-8 text-xs bg-background/50 border-border/60"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0">Sort:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSortMode("default")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  sortMode === "default"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Canonical
              </button>
              <button
                type="button"
                onClick={() => setSortMode("largest-gap")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  sortMode === "largest-gap"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Largest Gap
              </button>
              <button
                type="button"
                onClick={() => setSortMode("highest-req")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  sortMode === "highest-req"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Highest Required
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse" role="table">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th scope="col" className="py-3 px-4 sm:px-6">
                  Category
                </th>
                <th scope="col" className="py-3 px-3 text-center">
                  Required (1-10)
                </th>
                <th scope="col" className="py-3 px-3 text-center">
                  Candidate (1-10)
                </th>
                <th scope="col" className="py-3 px-4 min-w-[200px]">
                  Attainment Comparison
                </th>
                <th scope="col" className="py-3 px-4 text-center">
                  Gap Status
                </th>
                <th scope="col" className="py-3 px-4 text-center">
                  Profile Evidence
                </th>
                <th scope="col" className="py-3 px-4 text-center">
                  Suggested Focus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredAndSortedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                    No categories matched the current filter/search.
                  </td>
                </tr>
              ) : (
                filteredAndSortedItems.map((row) => {
                  const meta = CATEGORY_METADATA[row.category_code];
                  const isSurplus = row.candidate_level > row.required_level;
                  const isMet = !row.gap && !isSurplus;
                  const surplusAmount = row.candidate_level - row.required_level;
                  const isExpanded = expandedCategories.has(row.category_code);

                  const attainmentPct = Math.min(
                    100,
                    Math.round((row.attainment / row.required_level) * 100),
                  );

                  return (
                    <React.Fragment key={row.category_code}>
                      <tr
                        className={`hover:bg-muted/20 transition-colors group ${
                          isExpanded ? "bg-muted/10" : ""
                        }`}
                      >
                        {/* Category Code & Name */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
                              {row.category_code}
                            </span>
                            <div>
                              <div className="font-medium text-foreground text-sm flex items-center gap-1.5">
                                {meta?.name || row.category_code}
                                {meta?.description && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          aria-label={`Details for ${meta.name}`}
                                          className="text-muted-foreground/60 hover:text-muted-foreground focus:outline-none"
                                        >
                                          <HelpCircle className="w-3.5 h-3.5" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="max-w-xs text-xs">
                                        {meta.description}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Required Level */}
                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-foreground">
                          {row.required_level}
                        </td>

                        {/* Candidate Level */}
                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-foreground">
                          {row.candidate_level}
                        </td>

                        {/* Attainment Comparison Bar */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground font-mono">
                              <span>
                                Attainment: {row.attainment}/{row.required_level}
                              </span>
                              <span className="font-semibold text-foreground">
                                {attainmentPct}%
                              </span>
                            </div>
                            <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden relative">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                  row.gap
                                    ? "bg-amber-500"
                                    : isSurplus
                                      ? "bg-emerald-500"
                                      : "bg-emerald-500"
                                }`}
                                style={{ width: `${(row.attainment / 10) * 100}%` }}
                              />
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10"
                                style={{ left: `${(row.required_level / 10) * 100}%` }}
                                title={`Required Level: ${row.required_level}`}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Gap Status */}
                        <td className="py-3.5 px-4 text-center">
                          {isSurplus ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs"
                            >
                              <ArrowUpRight className="w-3 h-3" /> Surplus (+{surplusAmount})
                            </Badge>
                          ) : isMet ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Met Level
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-xs"
                            >
                              <AlertTriangle className="w-3 h-3" /> Gap (-{row.gap_amount})
                            </Badge>
                          )}
                        </td>

                        {/* Profile Evidence Status */}
                        <td className="py-3.5 px-4 text-center">
                          {row.profile_evidence_status === "source_supported" ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="bg-primary/10 text-primary border-primary/30 text-xs font-normal cursor-help gap-1"
                                  >
                                    <FileCheck className="w-3 h-3" /> Source-Supported
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs max-w-xs">
                                  Profile contains extracted skill evidence from resume or
                                  project/internship document.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="bg-muted text-muted-foreground border-border/60 text-xs font-normal cursor-help gap-1"
                                  >
                                    <User className="w-3 h-3" /> Self-Report Only
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs max-w-xs">
                                  No parsed document evidence in profile yet. Evaluation uses your
                                  self-assessed rating.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </td>

                        {/* Action / Focus Topics Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          {row.gap ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(row.category_code)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/5"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{isExpanded ? "Hide" : "Learning topics"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">No learning gap</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Focus Topics Drawer Row */}
                      {isExpanded && (
                        <tr className="bg-muted/15 border-b border-border/40">
                          <td colSpan={7} className="py-3.5 px-6 sm:px-8">
                            <div className="space-y-2.5 animate-fade-in">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Suggested focus
                                  areas (general guidance, not official RADIX curriculum)
                                </span>
                                {row.gap && (
                                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                    Targeting +{row.gap_amount} level improvement to meet{" "}
                                    {companyName}&apos;s level {row.required_level}
                                  </span>
                                )}
                              </div>
                              {row.learning_topics && row.learning_topics.length > 0 ? (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    Validated RADIX Curriculum Topics:
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {row.learning_topics.map((topic) => (
                                      <span
                                        key={topic}
                                        className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium"
                                      >
                                        {topic}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted-foreground">
                                  No validated learning topics are available for this gap yet.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
