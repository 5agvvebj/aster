import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseSelection,
  selectEvidence,
} from "./provider";
import type { RetrievedFact } from "@/lib/grounding/retrieve";

const evidence: RetrievedFact[] = [
  {
    id: "birth-chart-definition",
    domain: "vedic_astrology",
    topic: "Birth charts",
    content: "A natal chart is a map calculated for a specific date, time, and place.",
    sourceLabel: "Aster curated educational notes v1",
    sourceUrl: null,
    tags: ["birth chart", "natal chart", "kundli"],
    score: 4,
    matched: 2,
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("evidence selection validation", () => {
  it("accepts only fact IDs supplied to the model", () => {
    expect(
      parseSelection('{"factIds":["birth-chart-definition"]}', evidence, "gemini"),
    ).toEqual(["birth-chart-definition"]);
  });

  it("rejects a model-selected ID that is not in retrieved evidence", () => {
    expect(() =>
      parseSelection('{"factIds":["invented-fact"]}', evidence, "gemini"),
    ).toThrow("returned invalid evidence selection");
  });

  it("rejects malformed or non-JSON model output", () => {
    expect(() => parseSelection("Here is your answer", evidence, "groq")).toThrow(
      "returned invalid evidence selection",
    );
  });
});

describe("provider selection", () => {
  it("uses the curated evidence path when no provider keys are configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GROQ_API_KEY", "");

    await expect(selectEvidence("What is a birth chart?", evidence)).resolves.toEqual({
      factIds: ["birth-chart-definition"],
      provider: "curated",
    });
  });

  it("uses Groq when Gemini fails and applies the same evidence validation", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
    vi.stubEnv("GROQ_API_KEY", "test-groq-key");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"factIds":["birth-chart-definition"]}' } }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(selectEvidence("What is a birth chart?", evidence)).resolves.toEqual({
      factIds: ["birth-chart-definition"],
      provider: "groq",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(errorLog).toHaveBeenCalledOnce();
  });

  it("does not accept an unsupported Groq fact even after Gemini fails", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
    vi.stubEnv("GROQ_API_KEY", "test-groq-key");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response("", { status: 503 }))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              choices: [{ message: { content: '{"factIds":["made-up"]}' } }],
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        ),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(selectEvidence("What is a birth chart?", evidence)).rejects.toMatchObject({
      name: "ModelUnavailableError",
    });
  });
});
