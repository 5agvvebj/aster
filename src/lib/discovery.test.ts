import { describe, expect, it } from "vitest";
import { getDiscoveryRecommendation } from "./discovery";

describe("personal discovery recommendations", () => {
  it("uses the user's recent topic and explains why it is recommended", () => {
    expect(getDiscoveryRecommendation(["What is the seventh house?", "How do astrologers approach compatibility?"])).toEqual({
      label: "relationships",
      question: "How do astrologers approach compatibility, and what are its limits?",
      reason: "Suggested because your recent questions mention relationships.",
    });
  });

  it("uses a general starting question when no related history exists", () => {
    expect(getDiscoveryRecommendation([]).label).toBe("astrology foundations");
    expect(getDiscoveryRecommendation(["What is a Rashi?"]).reason).toContain("general concept");
  });
});
