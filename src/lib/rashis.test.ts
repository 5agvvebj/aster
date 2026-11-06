import { describe, expect, it } from "vitest";
import { getRashi, rashis } from "./rashis";

describe("Rashi reference data", () => {
  it("contains twelve distinct signs with the expected traditional rulers", () => {
    expect(rashis).toHaveLength(12);
    expect(new Set(rashis.map((rashi) => rashi.slug)).size).toBe(12);
    expect(rashis.map(({ slug, ruler }) => [slug, ruler])).toEqual([
      ["mesha", "Mars · Mangala"],
      ["vrishabha", "Venus · Shukra"],
      ["mithuna", "Mercury · Budha"],
      ["karka", "Moon · Chandra"],
      ["simha", "Sun · Surya"],
      ["kanya", "Mercury · Budha"],
      ["tula", "Venus · Shukra"],
      ["vrishchika", "Mars · Mangala"],
      ["dhanu", "Jupiter · Guru"],
      ["makara", "Saturn · Shani"],
      ["kumbha", "Saturn · Shani"],
      ["meena", "Jupiter · Guru"],
    ]);
  });

  it("finds a sign by its stable route slug and rejects unknown signs", () => {
    expect(getRashi("simha")?.name).toBe("Leo");
    expect(getRashi("not-a-rashi")).toBeUndefined();
  });
});
