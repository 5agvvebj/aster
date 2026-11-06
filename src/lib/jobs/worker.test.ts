import { describe, expect, it } from "vitest";
import { generateSavedSummary, retryDelayMs } from "./worker";

describe("saved insight background jobs", () => {
  it("creates a compact summary from stored answer text", () => {
    expect(
      generateSavedSummary(
        "What is a birth chart?",
        "A birth chart maps positions. Astrologers interpret those positions.",
      ),
    ).toBe("A birth chart maps positions. Astrologers interpret those positions.");
  });

  it("rejects missing source content instead of creating an empty summary", () => {
    expect(() => generateSavedSummary("A question", "  ")).toThrow(
      "A saved answer needs both a question and answer text.",
    );
  });

  it("uses bounded exponential retry delays", () => {
    expect(retryDelayMs(1)).toBe(5_000);
    expect(retryDelayMs(2)).toBe(10_000);
    expect(retryDelayMs(3)).toBe(20_000);
    expect(retryDelayMs(20)).toBe(5 * 60_000);
  });
});
