import { describe, expect, it } from "vitest";
import { isOutsideEducationalScope } from "./scope";

describe("educational question scope", () => {
  it("allows general educational questions phrased conversationally", () => {
    expect(isOutsideEducationalScope("What is a birth chart and what can it tell me?")).toBe(false);
    expect(isOutsideEducationalScope("How do astrologers approach compatibility?")).toBe(false);
  });

  it("blocks personal chart interpretation and predictions", () => {
    expect(isOutsideEducationalScope("What does my chart say about my career?")).toBe(true);
    expect(isOutsideEducationalScope("When will I get married next year?")).toBe(true);
  });

  it("blocks personal readings phrased in supported languages", () => {
    expect(isOutsideEducationalScope("मेरी कुंडली में करियर कैसा है?", "hi")).toBe(true);
    expect(isOutsideEducationalScope("¿Cuándo me casaré?", "es")).toBe(true);
    expect(isOutsideEducationalScope("Quand vais-je me marier ?", "fr")).toBe(true);
    expect(isOutsideEducationalScope("Wann werde ich heiraten?", "de")).toBe(true);
    expect(isOutsideEducationalScope("Quando vou me casar?", "pt")).toBe(true);
  });

  it("allows general educational questions in supported languages", () => {
    expect(isOutsideEducationalScope("ज्योतिष में वक्री गति क्या है?", "hi")).toBe(false);
    expect(isOutsideEducationalScope("¿Qué significa movimiento retrógrado?", "es")).toBe(false);
  });
});
