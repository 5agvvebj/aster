import { describe, expect, it } from "vitest";
import { rankEvidenceFacts } from "./retrieve";

const facts = [
  {
    id: "birth-chart-definition",
    domain: "vedic_astrology",
    topic: "Birth charts",
    content: "A natal chart is a map calculated for a specific date, time, and geographic location.",
    sourceLabel: "Aster curated educational notes v1",
    sourceUrl: null,
    tags: ["birth chart", "natal chart", "kundli", "birth", "date", "time", "place"],
  },
  {
    id: "retrograde-apparent-motion",
    domain: "vedic_astrology",
    topic: "Retrograde motion",
    content: "A planet appears retrograde because of the relative motions of Earth and that planet.",
    sourceLabel: "Aster curated educational notes v1",
    sourceUrl: null,
    tags: ["retrograde", "planet", "backward", "motion", "earth"],
  },
];

describe("rankEvidenceFacts", () => {
  it("retrieves relevant stored facts for a supported general question", () => {
    const result = rankEvidenceFacts("What is a birth chart?", facts);

    expect(result.map((fact) => fact.id)).toContain("birth-chart-definition");
    expect(result.map((fact) => fact.id)).not.toContain("retrograde-apparent-motion");
  });

  it("returns no evidence for an unrelated question", () => {
    expect(rankEvidenceFacts("What is the best laptop for gaming?", facts)).toEqual([]);
  });

  it("does not turn a personal prediction into chart evidence", () => {
    expect(rankEvidenceFacts("When will I get married?", facts)).toEqual([]);
  });

  it("retrieves a reviewed fact from Hindi keywords and returns Hindi content", () => {
    const result = rankEvidenceFacts("जन्म कुंडली क्या है?", facts, "hi");
    const birthChart = result.find((fact) => fact.id === "birth-chart-definition");

    expect(birthChart?.content).toContain("जन्म कुंडली");
  });

  it("retrieves reviewed facts from Spanish keywords and returns Spanish content", () => {
    const result = rankEvidenceFacts("¿Qué es una carta natal?", facts, "es");
    const birthChart = result.find((fact) => fact.id === "birth-chart-definition");

    expect(birthChart?.content).toContain("Una carta natal");
  });

  it("retrieves reviewed birth-chart facts in French, German, and Portuguese", () => {
    const french = rankEvidenceFacts("Qu'est-ce qu'un thème natal ?", facts, "fr");
    const german = rankEvidenceFacts("Was ist ein Geburtshoroskop?", facts, "de");
    const portuguese = rankEvidenceFacts("O que é mapa natal?", facts, "pt");

    expect(french.find((fact) => fact.id === "birth-chart-definition")?.content).toContain("Un thème natal");
    expect(german.find((fact) => fact.id === "birth-chart-definition")?.content).toContain("Ein Geburtshoroskop");
    expect(portuguese.find((fact) => fact.id === "birth-chart-definition")?.content).toContain("Um mapa natal");
  });
});
