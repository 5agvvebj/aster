import { describe, expect, it } from "vitest";
import { calculatePanchang, getCurrentDateInTimeZone } from "./panchang";

describe("Panchang calculations", () => {
  it("calculates sunrise and traditional calendar markers for the selected city and date", () => {
    const result = calculatePanchang("2024-04-08", "delhi");
    const sunrise = new Date(result.sunrise);

    expect(result.city).toBe("New Delhi");
    expect(result.timezone).toBe("Asia/Kolkata");
    expect(sunrise.toISOString()).toBe(result.sunrise);
    expect(sunrise.getUTCHours()).toBeGreaterThanOrEqual(0);
    expect(sunrise.getUTCHours()).toBeLessThan(3);
    expect(result.tithiIndex).toBeGreaterThanOrEqual(0);
    expect(result.tithiIndex).toBeLessThan(30);
    expect(result.nakshatra).toBeTruthy();
    expect(result.yoga).toBeTruthy();
    expect(result.karana).toBeTruthy();
  });

  it("rejects invalid calendar dates", () => {
    expect(() => calculatePanchang("2024-02-31", "delhi")).toThrow("valid calendar date");
  });

  it("uses the chosen city's local date for today's default", () => {
    expect(getCurrentDateInTimeZone("Asia/Kolkata", new Date("2024-12-31T20:00:00Z"))).toBe("2025-01-01");
  });
});
