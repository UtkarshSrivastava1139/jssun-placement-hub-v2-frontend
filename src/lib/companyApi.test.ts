import { describe, expect, it } from "vitest";
import { assembleCompanySkills } from "./companyApi";

describe("database skill assembly", () => {
  it("joins skills and proficiency by ID, not response order", () => {
    const result = assembleCompanySkills(
      [{ company_id: 42, skill_set_id: 9, required_level: 7, required_proficiency_level_id: 3 }],
      [
        { skill_set_id: 2, skill_set_name: "Other", short_name: "Other" },
        { skill_set_id: 9, skill_set_name: "SQL", short_name: "SQL" },
      ],
      [{ proficiency_level_id: 3, proficiency_name: "Advanced", proficiency_code: "ADV" }],
      [],
    );
    expect(result.skills[0]).toMatchObject({
      id: 9,
      name: "SQL",
      score: 7,
      proficiency: "Advanced",
    });
  });
  it("preserves ten ordered roadmap levels with missing levels unavailable", () => {
    const result = assembleCompanySkills(
      [{ company_id: 42, skill_set_id: 9, required_level: 7, required_proficiency_level_id: 3 }],
      [],
      [],
      [
        { skill_set_id: 9, level_number: 10, topics: "Optimization" },
        { skill_set_id: 9, level_number: 1, topics: "Basics" },
      ],
    );
    expect(result.topics[9]).toHaveLength(10);
    expect(result.topics[9]?.[0]).toBe("Basics");
    expect(result.topics[9]?.[1]).toBe("Not Available");
    expect(result.topics[9]?.[9]).toBe("Optimization");
  });
});
