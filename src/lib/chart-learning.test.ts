import { describe, expect, it } from "vitest";
import { getConcept, grahas, houses } from "./chart-learning";

describe("chart learning reference", () => {
  it("contains twelve educational house concepts and nine Navagrahas", () => {
    expect(houses).toHaveLength(12);
    expect(grahas).toHaveLength(9);
    expect(grahas.some((graha) => graha.id === "graha-rahu")).toBe(true);
    expect(grahas.some((graha) => graha.id === "graha-ketu")).toBe(true);
  });

  it("describes Rahu as a lunar node rather than a physical planet", () => {
    expect(getConcept("graha-rahu")?.summary).toContain("not a physical planet");
  });

  it("returns no invented placement for an unknown concept", () => {
    expect(getConcept("saturn-in-seventh-house")).toBeUndefined();
  });
});
