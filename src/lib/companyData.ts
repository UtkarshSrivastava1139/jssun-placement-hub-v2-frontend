// Pure normalizers. Inputs are raw JSON shapes (short_json / full_json / skill_levels)
// so Phase 2 can pipe database rows in unchanged.

export type CompanyTier = "Super Dream" | "Dream" | "Standard" | "Regular";
export const TIERS: CompanyTier[] = ["Super Dream", "Dream", "Standard", "Regular"];

export interface CompanySummary {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
  category: string;
  companyType: CompanyTier;
  incorporationYear: string;
  employeeSize: string;
  headquarters: string;
  yoyGrowth: string;
  websiteUrl: string;
}

export type CompanyProfile = Record<string, string> & {
  name: string;
  short_name: string;
};

export type Bloom = "CU" | "AP" | "AS" | "EV" | "CR";
export type Criticality = "Critical" | "Important" | "Baseline";
export type Difficulty = "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";

export interface DashboardSkill {
  id: number;
  name: string;
  score: number;
  proficiency: string;
  bloom: Bloom;
  criticality: Criticality;
  difficulty: Difficulty;
}

/** Keys that must never be displayed anywhere in the portal. */
const FORBIDDEN_KEY = /(ctc|stipend|selection_ratio|selection ratio)/i;
export const isForbiddenKey = (key: string) => FORBIDDEN_KEY.test(key);

const NULLISH = new Set(["", "na", "n/a", "none", "-", "null", "undefined"]);
export function isNullish(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  return NULLISH.has(String(v).trim().toLowerCase());
}

export function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.map(asString).join("; ");
  return String(v).trim();
}

export function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function splitItems(v: unknown): string[] {
  return asString(v)
    .split(/\n|;|•|(?<=\.)\s+(?=[A-Z])/)
    .map((s) =>
      s
        .replace(/^[-•*\s]+/, "")
        .replace(/\.$/, "")
        .trim(),
    )
    .filter(Boolean);
}

export function titleCaseFromCode(code: string): string {
  return code
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) =>
      w.length <= 3 && w === w.toUpperCase() ? w : (w[0] ?? "").toUpperCase() + w.slice(1),
    )
    .join(" ");
}

export function scoreToDifficulty(score: number): Difficulty {
  if (score >= 8) return "EXPERT";
  if (score >= 6) return "ADVANCED";
  if (score >= 4) return "PRO";
  return "BEGINNER";
}

export function proficiencyToBloom(level: number): Bloom {
  if (level <= 2) return "CU";
  if (level <= 4) return "AP";
  if (level <= 6) return "AS";
  if (level <= 8) return "EV";
  return "CR";
}

export function scoreToCriticality(score: number): Criticality {
  if (score >= 7) return "Critical";
  if (score >= 5) return "Important";
  return "Baseline";
}

function toTier(v: unknown): CompanyTier {
  const s = asString(v)
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
  if (s.includes("super")) return "Super Dream";
  if (s.includes("dream")) return "Dream";
  if (s.includes("standard")) return "Standard";
  return "Regular";
}

export function normalizeCompanySummary(shortJson: unknown, id = 0): CompanySummary {
  const r = asRecord(shortJson);
  const officePrimary = asString(r["office_locations"]).split(";")[0]?.trim() || "";
  const hq = asString(r["headquarters_address"]) || asString(r["headquarters"]) || officePrimary;

  return {
    id,
    name: asString(r["name"]),
    shortName: asString(r["short_name"]) || asString(r["name"]),
    logoUrl: asString(r["logo_url"]),
    category: asString(r["category"]),
    companyType: toTier(r["company_type"]),
    incorporationYear: asString(r["incorporation_year"]),
    employeeSize: asString(r["employee_size"]),
    headquarters: hq,
    yoyGrowth: asString(r["yoy_growth_rate"]),
    websiteUrl: asString(r["website_url"]),
  };
}

export function normalizeCompanyProfile(fullJson: unknown, shortJson: unknown): CompanyProfile {
  const merged = { ...asRecord(shortJson), ...asRecord(fullJson) };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (isForbiddenKey(k)) continue;
    out[k] = asString(v);
  }
  return out as CompanyProfile;
}

export function normalizeDashboardSkills(skillLevels: unknown): DashboardSkill[] {
  const arr = Array.isArray(skillLevels) ? skillLevels : [];
  return arr
    .map((raw) => {
      const r = asRecord(raw);
      const score = Math.max(0, Math.min(10, Number(r["required_level"]) || 0));
      return {
        id: Number(r["skill_set_id"]) || 0,
        name: asString(r["skill_set_name"]),
        score,
        proficiency: asString(r["required_proficiency"]),
        bloom: proficiencyToBloom(score),
        criticality: scoreToCriticality(score),
        difficulty: scoreToDifficulty(score),
      };
    })
    .sort((a, b) => b.score - a.score);
}
