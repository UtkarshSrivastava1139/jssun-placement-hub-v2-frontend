export const RADIX_CATEGORY_CODES = [
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
  "OTHER",
] as const;

export type RadixCategoryCode = (typeof RADIX_CATEGORY_CODES)[number];
export type ExtractionConfidence = "high" | "medium" | "low";
export type RequirementType = "required" | "preferred" | "unknown";

export interface JdSkillRequirement {
  skill_name: string;
  category_code: RadixCategoryCode;
  evidence: string;
  confidence: ExtractionConfidence;
  requirement_type: RequirementType;
  canonical_skill_key?: string | null;
}

export interface JdExtractionResult {
  schema_version: "1.0.0";
  source_type: "jd";
  source_file: string;
  company: string | null;
  role: string | null;
  location: string | null;
  skills: JdSkillRequirement[];
  warnings: string[];
}

export interface SavedJobDescriptionRecord {
  job_description_id: string;
  schema_version: "1.0.0";
  extraction: JdExtractionResult;
  created_at: string;
}

const REQUIREMENT_TYPES: readonly string[] = ["required", "preferred", "unknown"];
const CONFIDENCE_LEVELS: readonly string[] = ["high", "medium", "low"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

export function validateJdExtractionResult(value: unknown): string[] {
  const errors: string[] = [];
  const allowedFields = [
    "schema_version",
    "source_type",
    "source_file",
    "company",
    "role",
    "location",
    "skills",
    "warnings",
  ];
  if (!isRecord(value)) return ["The extraction result must be an object."];
  if (!hasOnlyKeys(value, allowedFields))
    errors.push("The extraction result has unsupported fields.");
  if (value["schema_version"] !== "1.0.0") errors.push("The schema version is unsupported.");
  if (value["source_type"] !== "jd") errors.push("The source type must be jd.");

  const sourceFile = value["source_file"];
  if (
    typeof sourceFile !== "string" ||
    sourceFile.length < 1 ||
    sourceFile.length > 255 ||
    /[\\/]/.test(sourceFile)
  ) {
    errors.push("The source file must be a filename without a path.");
  }

  for (const field of ["company", "role", "location"] as const) {
    const entry = value[field];
    if (entry !== null && (typeof entry !== "string" || entry.length > 200)) {
      errors.push(`${field} must be a string of at most 200 characters or null.`);
    }
  }

  if (!Array.isArray(value["skills"])) {
    errors.push("Skills must be an array.");
  } else {
    const skillFields = [
      "skill_name",
      "category_code",
      "evidence",
      "confidence",
      "requirement_type",
      "canonical_skill_key",
    ];
    value["skills"].forEach((skill, index) => {
      if (!isRecord(skill)) {
        errors.push(`Skill ${index + 1} must be an object.`);
        return;
      }
      if (!hasOnlyKeys(skill, skillFields))
        errors.push(`Skill ${index + 1} has unsupported fields.`);
      if (
        typeof skill["skill_name"] !== "string" ||
        !skill["skill_name"].trim() ||
        skill["skill_name"].length > 120
      ) {
        errors.push(`Skill ${index + 1} needs a name of 1–120 characters.`);
      }
      if (!RADIX_CATEGORY_CODES.includes(skill["category_code"] as RadixCategoryCode)) {
        errors.push(`Skill ${index + 1} has an invalid category.`);
      }
      if (
        typeof skill["evidence"] !== "string" ||
        !skill["evidence"].trim() ||
        skill["evidence"].length > 500
      ) {
        errors.push(`Skill ${index + 1} needs source evidence of 1–500 characters.`);
      }
      if (
        typeof skill["confidence"] !== "string" ||
        !CONFIDENCE_LEVELS.includes(skill["confidence"])
      ) {
        errors.push(`Skill ${index + 1} has an invalid confidence value.`);
      }
      if (
        typeof skill["requirement_type"] !== "string" ||
        !REQUIREMENT_TYPES.includes(skill["requirement_type"])
      ) {
        errors.push(`Skill ${index + 1} has an invalid requirement priority.`);
      }
      const canonicalKey = skill["canonical_skill_key"];
      if (
        canonicalKey !== undefined &&
        canonicalKey !== null &&
        (typeof canonicalKey !== "string" || canonicalKey.length > 120)
      ) {
        errors.push(`Skill ${index + 1} has an invalid canonical skill key.`);
      }
    });
  }

  if (
    !Array.isArray(value["warnings"]) ||
    value["warnings"].some((warning) => typeof warning !== "string" || warning.length > 500)
  ) {
    errors.push("Warnings must be strings of at most 500 characters.");
  }
  return errors;
}

export type ExtractJd = (input: File | string) => Promise<unknown>;
export type SaveJd = (draft: JdExtractionResult) => Promise<void>;
