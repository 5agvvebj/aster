import { describe, expect, it } from "vitest";
import { calculateBirthChart } from "./birth-chart";

describe("local birth chart calculations", () => {
  it("calculates sidereal Navagraha placements and whole-sign houses in the browser-safe library", () => {
    const chart = calculateBirthChart(
      {
        localDateTime: "2024-03-20T12:00",
        utcOffsetHours: 0,
        latitude: 0,
        longitude: 0,
      },
      new Date("2025-01-01T00:00:00Z"),
    );

    expect(chart.placements).toHaveLength(9);
    expect(chart.placements.find(({ name }) => name === "Sun")?.sign).toBe("Meena");
    expect(chart.ascendant.house).toBe(1);
    expect(chart.placements.every(({ house }) => house >= 1 && house <= 12)).toBe(true);
    expect(chart.currentDasha).not.toBeNull();
    expect(chart.dashaPeriods.length).toBeGreaterThan(1);
  });

  it("applies the entered UTC offset without storing or sending birth data", () => {
    const chart = calculateBirthChart(
      {
        localDateTime: "2000-01-01T12:00",
        utcOffsetHours: 5.5,
        latitude: 28.6139,
        longitude: 77.209,
      },
      new Date("2025-01-01T00:00:00Z"),
    );

    expect(chart.birthDateUTC.toISOString()).toBe("2000-01-01T06:30:00.000Z");
  });

  it.each([
    [{ localDateTime: "2024-02-31T12:00", utcOffsetHours: 0, latitude: 0, longitude: 0 }, "valid local birth date"],
    [{ localDateTime: "2024-03-20T12:00", utcOffsetHours: 0, latitude: 91, longitude: 0 }, "Latitude"],
    [{ localDateTime: "2024-03-20T12:00", utcOffsetHours: 0, latitude: 0, longitude: 181 }, "Longitude"],
    [{ localDateTime: "2024-03-20T12:00", utcOffsetHours: 15, latitude: 0, longitude: 0 }, "UTC offset"],
  ])("rejects invalid coordinates and offsets", (input, message) => {
    expect(() => calculateBirthChart(input, new Date("2025-01-01T00:00:00Z"))).toThrow(message);
  });
});
