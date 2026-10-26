import { describe, expect, it } from "vitest";
import {
  isNullish,
  normalizeCompanyProfile,
  proficiencyToBloom,
  scoreToCriticality,
  scoreToDifficulty,
} from "./companyData";
import { SEED_COMPANIES } from "@/data/seedCompanies";

describe("rules", () => {
  it("maps proficiency to Bloom", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(proficiencyToBloom)).toEqual([
      "CU",
      "CU",
      "AP",
      "AP",
      "AS",
      "AS",
      "EV",
      "EV",
      "CR",
      "CR",
    ]);
  });
  it("maps score to criticality", () => {
    expect(scoreToCriticality(7)).toBe("Critical");
    expect(scoreToCriticality(5)).toBe("Important");
    expect(scoreToCriticality(4)).toBe("Baseline");
  });
  it("maps score to difficulty", () => {
    expect(scoreToDifficulty(8)).toBe("EXPERT");
    expect(scoreToDifficulty(6)).toBe("ADVANCED");
    expect(scoreToDifficulty(4)).toBe("PRO");
    expect(scoreToDifficulty(3)).toBe("BEGINNER");
  });
  it("detects nullish values", () => {
    for (const v of ["NA", "n/a", "None", "-", "null", "undefined", ""])
      expect(isNullish(v)).toBe(true);
    expect(isNullish("Dublin")).toBe(false);
  });
  it("strips CTC/stipend/selection ratio fields", () => {
    const p = normalizeCompanyProfile(
      { ctc: "10", stipend: "5", selection_ratio: "1%", name: "X" },
      {},
    );
    expect(Object.keys(p)).toEqual(["name"]);
  });
  it("seed has one company with 12 skills", () => {
    expect(SEED_COMPANIES).toHaveLength(1);
    expect(SEED_COMPANIES[0]?.skill_levels).toHaveLength(12);
  });
});
