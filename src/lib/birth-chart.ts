import { Body, EclipticLongitude, SiderealTime, SunPosition } from "astronomy-engine";

const DAY_MS = 86_400_000;
const SIDEREAL_YEAR_DAYS = 365.2425;
const SIGNS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
] as const;
const NAKSHATRAS = [
  ["Ashwini", "Ketu"], ["Bharani", "Venus"], ["Krittika", "Sun"],
  ["Rohini", "Moon"], ["Mrigashira", "Mars"], ["Ardra", "Rahu"],
  ["Punarvasu", "Jupiter"], ["Pushya", "Saturn"], ["Ashlesha", "Mercury"],
  ["Magha", "Ketu"], ["Purva Phalguni", "Venus"], ["Uttara Phalguni", "Sun"],
  ["Hasta", "Moon"], ["Chitra", "Mars"], ["Swati", "Rahu"],
  ["Vishakha", "Jupiter"], ["Anuradha", "Saturn"], ["Jyeshtha", "Mercury"],
  ["Mula", "Ketu"], ["Purva Ashadha", "Venus"], ["Uttara Ashadha", "Sun"],
  ["Shravana", "Moon"], ["Dhanishta", "Mars"], ["Shatabhisha", "Rahu"],
  ["Purva Bhadrapada", "Jupiter"], ["Uttara Bhadrapada", "Saturn"], ["Revati", "Mercury"],
] as const;
const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] as const;
const DASHA_YEARS: Record<(typeof DASHA_ORDER)[number], number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const PLANETS = [
  { name: "Sun", symbol: "☉", body: Body.Sun },
  { name: "Moon", symbol: "☾", body: Body.Moon },
  { name: "Mars", symbol: "♂", body: Body.Mars },
  { name: "Mercury", symbol: "☿", body: Body.Mercury },
  { name: "Jupiter", symbol: "♃", body: Body.Jupiter },
  { name: "Venus", symbol: "♀", body: Body.Venus },
  { name: "Saturn", symbol: "♄", body: Body.Saturn },
] as const;

export type BirthChartInput = {
  localDateTime: string;
  utcOffsetHours: number;
  latitude: number;
  longitude: number;
};

export type BirthChartPlacement = {
  name: string;
  symbol: string;
  longitude: number;
  sign: (typeof SIGNS)[number];
  signIndex: number;
  degreeInSign: number;
  house: number;
};

export type DashaPeriod = {
  lord: (typeof DASHA_ORDER)[number];
  years: number;
  start: Date;
  end: Date;
};

export type BirthChart = {
  birthDateUTC: Date;
  ayanamsa: number;
  ascendant: BirthChartPlacement;
  placements: BirthChartPlacement[];
  moonNakshatra: string;
  dashaPeriods: DashaPeriod[];
  currentDasha: DashaPeriod | null;
};

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function approximateLahiriAyanamsa(date: Date): number {
  const yearsSinceJ2000 = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / DAY_MS / SIDEREAL_YEAR_DAYS;
  return 23.85305555 + (yearsSinceJ2000 * 50.290966) / 3600;
}

function signPlacement(longitude: number): Pick<BirthChartPlacement, "longitude" | "sign" | "signIndex" | "degreeInSign"> {
  const normalized = normalizeDegrees(longitude);
  const signIndex = Math.floor(normalized / 30);
  return {
    longitude: normalized,
    sign: SIGNS[signIndex],
    signIndex,
    degreeInSign: normalized - signIndex * 30,
  };
}

function getLocalBirthDate(input: BirthChartInput): Date {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(input.localDateTime);
  if (!dateParts) {
    throw new Error("Enter a valid local birth date and time.");
  }
  if (!Number.isFinite(input.utcOffsetHours) || input.utcOffsetHours < -12 || input.utcOffsetHours > 14) {
    throw new Error("UTC offset must be between -12 and +14 hours.");
  }
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    throw new Error("Latitude must be between -90 and +90 degrees.");
  }
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    throw new Error("Longitude must be between -180 and +180 degrees.");
  }

  const localAsUTC = Date.parse(`${input.localDateTime}:00Z`);
  const parsedDate = new Date(localAsUTC);
  if (!Number.isFinite(localAsUTC)
    || parsedDate.getUTCFullYear() !== Number(dateParts[1])
    || parsedDate.getUTCMonth() + 1 !== Number(dateParts[2])
    || parsedDate.getUTCDate() !== Number(dateParts[3])
    || parsedDate.getUTCHours() !== Number(dateParts[4])
    || parsedDate.getUTCMinutes() !== Number(dateParts[5])) {
    throw new Error("Enter a valid local birth date and time.");
  }
  return new Date(localAsUTC - input.utcOffsetHours * 60 * 60 * 1000);
}

function calculateAscendant(date: Date, latitude: number, longitude: number): number {
  const julianDay = date.getTime() / DAY_MS + 2440587.5;
  const centuries = (julianDay - 2451545) / 36525;
  const obliquity = (23.439291 - 0.0130042 * centuries) * (Math.PI / 180);
  const localSiderealAngle = normalizeDegrees(SiderealTime(date) * 15 + longitude) * (Math.PI / 180);
  const latitudeRadians = latitude * (Math.PI / 180);
  const a = Math.sin(latitudeRadians) * Math.sin(obliquity)
    + Math.cos(latitudeRadians) * Math.sin(localSiderealAngle) * Math.cos(obliquity);
  const b = Math.cos(latitudeRadians) * Math.cos(localSiderealAngle);
  return normalizeDegrees((Math.atan2(-b, a) + Math.PI) * (180 / Math.PI));
}

function meanAscendingNode(date: Date): number {
  const julianDay = date.getTime() / DAY_MS + 2440587.5;
  const centuries = (julianDay - 2451545) / 36525;
  return normalizeDegrees(
    125.04452
      - 1934.136261 * centuries
      + 0.0020708 * centuries ** 2
      + centuries ** 3 / 450000,
  );
}

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * SIDEREAL_YEAR_DAYS * DAY_MS);
}

function calculateDashas(moonLongitude: number, birthDate: Date, now: Date): {
  nakshatra: string;
  periods: DashaPeriod[];
  current: DashaPeriod | null;
} {
  const nakshatraWidth = 360 / 27;
  const nakshatraIndex = Math.floor(moonLongitude / nakshatraWidth);
  const [nakshatra, firstLord] = NAKSHATRAS[nakshatraIndex];
  const traversedFraction = (moonLongitude - nakshatraIndex * nakshatraWidth) / nakshatraWidth;
  const firstDashaIndex = DASHA_ORDER.indexOf(firstLord);
  const firstDuration = DASHA_YEARS[firstLord] * (1 - traversedFraction);
  const periods: DashaPeriod[] = [];
  let start = birthDate;

  for (let index = 0; index < DASHA_ORDER.length * 3 && periods.length < 24; index += 1) {
    const lord = DASHA_ORDER[(firstDashaIndex + index) % DASHA_ORDER.length];
    const years = index === 0 ? firstDuration : DASHA_YEARS[lord];
    const end = addYears(start, years);
    periods.push({ lord, years, start, end });
    start = end;
    if (start > now && periods.length >= 4) break;
  }

  return {
    nakshatra,
    periods,
    current: periods.find((period) => period.start <= now && now < period.end) ?? null,
  };
}

export function calculateBirthChart(input: BirthChartInput, now = new Date()): BirthChart {
  const birthDateUTC = getLocalBirthDate(input);
  if (birthDateUTC > now) throw new Error("Birth date and time cannot be in the future.");

  const ayanamsa = approximateLahiriAyanamsa(birthDateUTC);
  const siderealLongitude = (tropicalLongitude: number) => normalizeDegrees(tropicalLongitude - ayanamsa);
  const ascendantLongitude = siderealLongitude(calculateAscendant(birthDateUTC, input.latitude, input.longitude));
  const ascendantBase = signPlacement(ascendantLongitude);
  const ascendant: BirthChartPlacement = {
    name: "Ascendant",
    symbol: "ASC",
    ...ascendantBase,
    house: 1,
  };

  const rawPlacements: Array<{ name: string; symbol: string; longitude: number }> = PLANETS.map(({ name, symbol, body }) => ({
    name,
    symbol,
    longitude: siderealLongitude(body === Body.Sun
      ? SunPosition(birthDateUTC).elon
      : EclipticLongitude(body, birthDateUTC)),
  }));
  const rahuLongitude = siderealLongitude(meanAscendingNode(birthDateUTC));
  rawPlacements.push(
    { name: "Rahu", symbol: "☊", longitude: rahuLongitude },
    { name: "Ketu", symbol: "☋", longitude: normalizeDegrees(rahuLongitude + 180) },
  );

  const placements = rawPlacements.map((placement) => {
    const base = signPlacement(placement.longitude);
    return {
      ...placement,
      ...base,
      house: ((base.signIndex - ascendantBase.signIndex + 12) % 12) + 1,
    };
  });
  const moon = placements.find((placement) => placement.name === "Moon");
  if (!moon) throw new Error("The Moon position could not be calculated.");
  const dashas = calculateDashas(moon.longitude, birthDateUTC, now);

  return {
    birthDateUTC,
    ayanamsa,
    ascendant,
    placements,
    moonNakshatra: dashas.nakshatra,
    dashaPeriods: dashas.periods,
    currentDasha: dashas.current,
  };
}
