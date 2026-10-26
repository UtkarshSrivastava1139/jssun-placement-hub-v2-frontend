import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "./supabaseClient";
import {
  asString,
  normalizeCompanyProfile,
  normalizeCompanySummary,
  normalizeDashboardSkills,
} from "./companyData";

interface CompanyRow {
  company_id: number;
  short_json: unknown;
  full_json?: unknown;
}
interface SkillLevelRow {
  company_id: number;
  skill_set_id: number;
  required_level: number;
  required_proficiency_level_id: number;
}
interface SkillMasterRow {
  skill_set_id: number;
  skill_set_name: string;
  short_name: string;
}
interface ProficiencyRow {
  proficiency_level_id: number;
  proficiency_name: string;
  proficiency_code: string;
}
interface TopicRow {
  skill_set_id: number;
  level_number: number;
  topics: unknown;
}

export async function fetchCompanies() {
  const client = getSupabaseClient();
  const rows: CompanyRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client
      .from("company_json")
      .select("company_id, short_json")
      .order("company_id")
      .range(offset, offset + 999);
    if (error) throw new Error(`Unable to load companies: ${error.message}`);
    const batch = (data ?? []) as CompanyRow[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows.map((row) => normalizeCompanySummary(row.short_json, row.company_id));
}

export async function fetchCompanyProfile(id: number) {
  const { data, error } = await getSupabaseClient()
    .from("company_json")
    .select("company_id, short_json, full_json")
    .eq("company_id", id)
    .maybeSingle();
  if (error) throw new Error(`Unable to load company: ${error.message}`);
  if (!data) throw new Error("This company is no longer available.");
  const row = data as CompanyRow;
  return {
    summary: normalizeCompanySummary(row.short_json, row.company_id),
    profile: normalizeCompanyProfile(row.full_json, row.short_json),
  };
}

export function assembleCompanySkills(
  levels: SkillLevelRow[],
  masters: SkillMasterRow[],
  proficiencies: ProficiencyRow[],
  topicRows: TopicRow[],
) {
  const masterById = new Map(masters.map((row) => [row.skill_set_id, row]));
  const proficiencyById = new Map(proficiencies.map((row) => [row.proficiency_level_id, row]));
  const skills = normalizeDashboardSkills(
    levels.map((row) => ({
      ...row,
      skill_set_name:
        masterById.get(row.skill_set_id)?.skill_set_name ??
        masterById.get(row.skill_set_id)?.short_name ??
        "Not Available",
      required_proficiency:
        proficiencyById.get(row.required_proficiency_level_id)?.proficiency_name ?? "Not Available",
    })),
  );
  const topics: Record<number, string[]> = {};
  for (const skill of skills) topics[skill.id] = Array.from({ length: 10 }, () => "Not Available");
  for (const row of topicRows) {
    const ladder = topics[row.skill_set_id];
    if (
      ladder &&
      Number.isInteger(row.level_number) &&
      row.level_number >= 1 &&
      row.level_number <= 10
    ) {
      ladder[row.level_number - 1] = asString(row.topics) || "Not Available";
    }
  }
  return { skills, topics };
}

export async function fetchCompanySkills(id: number) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("company_skill_levels")
    .select("company_id, skill_set_id, required_level, required_proficiency_level_id")
    .eq("company_id", id);
  if (error) throw new Error(`Unable to load skills: ${error.message}`);
  const levels = (data ?? []) as SkillLevelRow[];
  if (!levels.length) return assembleCompanySkills([], [], [], []);
  const ids = [...new Set(levels.map((row) => row.skill_set_id))];
  const proficiencyIds = [...new Set(levels.map((row) => row.required_proficiency_level_id))];
  const [masters, proficiencies, topicResult] = await Promise.all([
    client
      .from("skill_set_master")
      .select("skill_set_id, skill_set_name, short_name")
      .in("skill_set_id", ids),
    client
      .from("proficiency_levels")
      .select("proficiency_level_id, proficiency_name, proficiency_code")
      .in("proficiency_level_id", proficiencyIds),
    client
      .from("skill_set_topics")
      .select("skill_set_id, level_number, topics")
      .in("skill_set_id", ids)
      .order("level_number"),
  ]);
  for (const result of [masters, proficiencies, topicResult]) {
    if (result.error) throw new Error(`Unable to load skill roadmap: ${result.error.message}`);
  }
  return assembleCompanySkills(
    levels,
    (masters.data ?? []) as SkillMasterRow[],
    (proficiencies.data ?? []) as ProficiencyRow[],
    (topicResult.data ?? []) as TopicRow[],
  );
}

export function useCompanies() {
  return useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });
}
export function useCompanyProfile(id: number | undefined) {
  return useQuery({
    queryKey: ["company-profile", id],
    enabled: id !== undefined,
    queryFn: () => {
      if (id === undefined) throw new Error("Select a company first.");
      return fetchCompanyProfile(id);
    },
  });
}
export function useCompanySkills(id: number | undefined) {
  return useQuery({
    queryKey: ["company-skills", id],
    enabled: id !== undefined,
    queryFn: () => {
      if (id === undefined) throw new Error("Select a company first.");
      return fetchCompanySkills(id);
    },
  });
}
