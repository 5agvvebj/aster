import { Body, EclipticLongitude, Observer, SearchRiseSet, SunPosition } from "astronomy-engine";

const DAY_MS = 86_400_000;
const SIDEREAL_YEAR_DAYS = 365.2425;
const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
  "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha",
  "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha",
  "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
] as const;
const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
  "Trayodashi", "Chaturdashi",
] as const;
const YOGAS = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
  "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha",
  "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
] as const;
const MOVING_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"] as const;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const TITHI_PREFIXES = ["Shukla", "Krishna"] as const;

export const panchangCities = {
  delhi: { name: "New Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" },
  mumbai: { name: "Mumbai", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
  bengaluru: { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata" },
  chennai: { name: "Chennai", latitude: 13.0827, longitude: 80.2707, timezone: "Asia/Kolkata" },
  kolkata: { name: "Kolkata", latitude: 22.5726, longitude: 88.3639, timezone: "Asia/Kolkata" },
  london: { name: "London", latitude: 51.5072, longitude: -0.1276, timezone: "Europe/London" },
  madrid: { name: "Madrid", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid" },
  paris: { name: "Paris", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },
  berlin: { name: "Berlin", latitude: 52.52, longitude: 13.405, timezone: "Europe/Berlin" },
  "new-york": { name: "New York", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  "sao-paulo": { name: "São Paulo", latitude: -23.5505, longitude: -46.6333, timezone: "America/Sao_Paulo" },
} as const;

export type PanchangCityId = keyof typeof panchangCities;

export type PanchangResult = {
  date: string;
  city: string;
  timezone: string;
  sunrise: string;
  weekday: (typeof WEEKDAYS)[number];
  tithi: string;
  tithiIndex: number;
  nakshatra: (typeof NAKSHATRAS)[number];
  yoga: (typeof YOGAS)[number];
  karana: string;
};

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

function approximateLahiriAyanamsa(date: Date) {
  const yearsSinceJ2000 = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / DAY_MS / SIDEREAL_YEAR_DAYS;
  return 23.85305555 + (yearsSinceJ2000 * 50.290966) / 3600;
}

function validateDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) throw new Error("Choose a valid calendar date.");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Choose a valid calendar date.");
  }
  return date;
}

function getKarana(halfTithiIndex: number) {
  if (halfTithiIndex === 0) return "Kimstughna";
  if (halfTithiIndex >= 57) return ["Shakuni", "Chatushpada", "Naga"][halfTithiIndex - 57];
  return MOVING_KARANAS[(halfTithiIndex - 1) % MOVING_KARANAS.length];
}

export function calculatePanchang(dateValue: string, cityId: PanchangCityId): PanchangResult {
  const date = validateDate(dateValue);
  const city = panchangCities[cityId];
  const sunrise = SearchRiseSet(
    Body.Sun,
    new Observer(city.latitude, city.longitude, 0),
    1,
    date,
    1,
  );
  if (!sunrise) throw new Error("Sunrise could not be calculated for that date and place.");

  const sunriseDate = sunrise.date;
  const sunLongitude = SunPosition(sunriseDate).elon;
  const moonLongitude = EclipticLongitude(Body.Moon, sunriseDate);
  const elongation = normalizeDegrees(moonLongitude - sunLongitude);
  const tithiIndex = Math.floor(elongation / 12);
  const tithiNumber = tithiIndex % 15;
  const tithi = tithiNumber === 14
    ? (tithiIndex < 15 ? "Purnima" : "Amavasya")
    : `${TITHI_PREFIXES[tithiIndex < 15 ? 0 : 1]} ${TITHIS[tithiNumber]}`;
  const ayanamsa = approximateLahiriAyanamsa(sunriseDate);
  const siderealSun = normalizeDegrees(sunLongitude - ayanamsa);
  const siderealMoon = normalizeDegrees(moonLongitude - ayanamsa);
  const nakshatraIndex = Math.floor(siderealMoon / (360 / NAKSHATRAS.length));
  const yogaIndex = Math.floor(normalizeDegrees(siderealSun + siderealMoon) / (360 / YOGAS.length));
  const weekday = WEEKDAYS[date.getUTCDay()];

  return {
    date: dateValue,
    city: city.name,
    timezone: city.timezone,
    sunrise: sunriseDate.toISOString(),
    weekday,
    tithi,
    tithiIndex,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    yoga: YOGAS[yogaIndex],
    karana: getKarana(Math.floor(elongation / 6)),
  };
}

export function getCurrentDateInTimeZone(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");
  if (!year || !month || !day) throw new Error("The current local calendar date could not be determined.");
  return `${year}-${month}-${day}`;
}
