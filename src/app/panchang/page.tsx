"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, MapPin, Moon, Sparkles, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { LanguageSelect, useLocale } from "@/lib/locale";
import { getCurrentDateInTimeZone, panchangCities, type PanchangCityId } from "@/lib/panchang";

const panchangSchema = z.object({
  date: z.string(),
  city: z.string(),
  timezone: z.string(),
  sunrise: z.string(),
  weekday: z.string(),
  tithi: z.string(),
  tithiIndex: z.number().int().min(0).max(29),
  nakshatra: z.string(),
  yoga: z.string(),
  karana: z.string(),
});

const localeCodes = {
  en: "en-IN",
  hi: "hi-IN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
} as const;

const reflections = {
  en: ["waxing", "waning"],
  hi: ["शुक्ल पक्ष", "कृष्ण पक्ष"],
  es: ["creciente", "menguante"],
  fr: ["croissante", "décroissante"],
  de: ["zunehmende", "abnehmende"],
  pt: ["crescente", "minguante"],
} as const;

export default function PanchangPage() {
  const { locale, t } = useLocale();
  const [city, setCity] = useState<PanchangCityId>("delhi");
  const [date, setDate] = useState("");
  const [dateEdited, setDateEdited] = useState(false);
  const [result, setResult] = useState<z.infer<typeof panchangSchema> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setDate(getCurrentDateInTimeZone("Asia/Kolkata"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    let active = true;

    void fetch("/api/panchang", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date, city }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok) {
          const errorMessage = z.object({ error: z.object({ message: z.string() }) }).safeParse(payload);
          throw new Error(errorMessage.success ? errorMessage.data.error.message : t("panchangError"));
        }
        const parsed = panchangSchema.safeParse(payload);
        if (!parsed.success) throw new Error(t("panchangError"));
        if (active) setResult(parsed.data);
      })
      .catch((cause: unknown) => {
        if (!active || (cause instanceof DOMException && cause.name === "AbortError")) return;
        setResult(null);
        setError(cause instanceof Error ? cause.message : t("panchangError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [date, city, t]);

  const cityData = panchangCities[city];
  const localeCode = localeCodes[locale];
  const sunriseTime = result
    ? new Intl.DateTimeFormat(localeCode, { hour: "numeric", minute: "2-digit", timeZone: result.timezone }).format(new Date(result.sunrise))
    : "";
  const dateLabel = result
    ? new Intl.DateTimeFormat(localeCode, { dateStyle: "full", timeZone: result.timezone }).format(new Date(`${result.date}T12:00:00Z`))
    : "";
  const phaseLabel = reflections[locale][result && result.tithiIndex < 15 ? 0 : 1];

  return (
    <main className="rashi-page panchang-page">
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/">
          <ArrowLeft size={15} /> {t("backHome")}
        </Link>
        <LanguageSelect />
      </header>

      <section className="panchang-hero">
        <p className="rashi-kicker"><Sun size={13} /> {t("dailyInsight")}</p>
        <h1>{t("viewPanchang")}</h1>
        <p>{t("panchangMethod")}</p>
      </section>

      <section className="panchang-controls" aria-label={`${t("location")} and date`}>
        <label>
          <span><MapPin size={14} /> {t("location")}</span>
          <select
            value={city}
            onChange={(event) => {
              const nextCity = event.currentTarget.value;
              if (!Object.hasOwn(panchangCities, nextCity)) return;
              setLoading(true);
              setError("");
              setResult(null);
              setCity(nextCity as PanchangCityId);
              if (!dateEdited) {
                setDate(getCurrentDateInTimeZone(panchangCities[nextCity as PanchangCityId].timezone));
              }
            }}
          >
            {Object.entries(panchangCities).map(([id, value]) => (
              <option key={id} value={id}>{value.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span><CalendarDays size={14} /> {t("today")}</span>
          <input
            type="date"
            value={date}
            required
            onChange={(event) => {
              const nextDate = event.currentTarget.value;
              if (!nextDate) {
                setLoading(false);
                setError(t("panchangError"));
                setResult(null);
                setDateEdited(true);
                setDate("");
                return;
              }
              setLoading(true);
              setError("");
              setResult(null);
              setDateEdited(true);
              setDate(nextDate);
            }}
          />
        </label>
        <span className="panchang-city-hint">
          {cityData.latitude.toFixed(2)}° {cityData.latitude >= 0 ? "N" : "S"}, {Math.abs(cityData.longitude).toFixed(2)}° {cityData.longitude >= 0 ? "E" : "W"}
        </span>
      </section>

      {error && <p className="panchang-error" role="alert">{error}</p>}

      <section className={`panchang-dashboard ${loading ? "panchang-loading" : ""}`} aria-busy={loading}>
        <div className="panchang-date-card">
          <div className="panchang-date-icon"><Moon size={21} /></div>
          <p className="rashi-kicker">{result?.city ?? cityData.name} · {result?.weekday ?? t("today")}</p>
          <h2>{dateLabel || t("today")}</h2>
          <div className="panchang-sunrise"><Sun size={15} /><span>{t("localSunrise")}</span><strong>{sunriseTime || "—"}</strong></div>
        </div>
        <div className="panchang-elements">
          {[
            { label: t("tithi"), value: result?.tithi, icon: Moon },
            { label: t("nakshatra"), value: result?.nakshatra, icon: Sparkles },
            { label: t("yoga"), value: result?.yoga, icon: Clock3 },
            { label: t("karana"), value: result?.karana, icon: CalendarDays },
          ].map(({ label, value, icon: Icon }) => (
            <article className="panchang-element" key={label}>
              <span className="panchang-element-icon"><Icon size={15} /></span>
              <span className="panchang-element-label">{label}</span>
              <strong>{value ?? "—"}</strong>
            </article>
          ))}
        </div>
      </section>

      {result && (
        <section className="panchang-reflection">
          <div className="panchang-reflection-icon"><Sparkles size={16} /></div>
          <div>
            <p className="rashi-kicker">{t("panchangReflection")}</p>
            <p>
              {locale === "hi"
                ? `आज की तिथि ${result.tithi} है और चंद्रमा ${phaseLabel} में है। यह पारंपरिक पंचांग का चंद्र-चरण संकेत है।`
                : locale === "es"
                  ? `La Luna está en fase ${phaseLabel} (${result.tithi}). Es una referencia lunar tradicional del calendario.`
                  : locale === "fr"
                    ? `La Lune est en phase ${phaseLabel} (${result.tithi}). C’est un repère lunaire traditionnel du calendrier.`
                    : locale === "de"
                      ? `Der Mond befindet sich in der ${phaseLabel} Mondphase (${result.tithi}), einer traditionellen Kalenderangabe.`
                      : locale === "pt"
                        ? `A Lua está na fase ${phaseLabel} (${result.tithi}), uma referência lunar tradicional do calendário.`
                        : `The Moon is in its ${phaseLabel} phase (${result.tithi}), a traditional lunar calendar marker.`}
            </p>
            <span>{t("panchangNote")}</span>
          </div>
        </section>
      )}

      <p className="panchang-method-note">{t("panchangMethod")}</p>

      <div className="panchang-links">
        <Link href="/sky">{t("openSky")} <ArrowUpRight size={14} /></Link>
        <Link href="/rashi">{t("exploreAllRashis")} <ArrowUpRight size={14} /></Link>
      </div>
    </main>
  );
}
