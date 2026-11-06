"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Orbit, Sparkles, Stars } from "lucide-react";
import { useState } from "react";
import { LanguageSelect, useLocale } from "@/lib/locale";
import { zodiacConstellations } from "@/lib/sky-data";
import { SkyGlobe } from "./sky-globe";

export default function SkyExplorerPage() {
  const { t } = useLocale();
  const [selectedSlug, setSelectedSlug] = useState("mesha");
  const selected = zodiacConstellations.find((item) => item.slug === selectedSlug) ?? zodiacConstellations[0];

  return (
    <main className="rashi-page sky-page">
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/">
          <ArrowLeft size={15} /> {t("backHome")}
        </Link>
        <LanguageSelect />
      </header>

      <section className="sky-hero">
        <div>
          <p className="rashi-kicker"><Stars size={13} /> {t("skyKicker")}</p>
          <h1>{t("skyTitle")}</h1>
          <p>{t("skyDescription")}</p>
        </div>
        <div className="sky-hero-orbit" aria-hidden="true"><Orbit size={48} strokeWidth={0.8} /></div>
      </section>

      <section className="sky-explorer" aria-label="Interactive zodiac sky explorer">
        <div className="sky-globe-panel">
          <SkyGlobe selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
          <p className="sky-interaction-hint"><Sparkles size={13} /> {t("skyRotate")}</p>
        </div>
        <aside className="sky-constellation-panel">
          <p className="rashi-kicker">{t("skySelection")}</p>
          <div className="sky-selected-title" style={{ "--sky-accent": selected.palette } as React.CSSProperties}>
            <span className="sky-selected-symbol">{selected.symbol}</span>
            <div>
              <span>{selected.rashi}</span>
              <h2>{selected.name}</h2>
            </div>
          </div>
          <p className="sky-stars-label">{t("skyFacts")}</p>
          <ul className="sky-star-list">
            {selected.stars.map((star) => (
              <li key={star.name}>
                <span className="sky-star-list-dot" />
                <span>{star.name}</span>
                <span className="sky-star-magnitude">{star.magnitude.toFixed(1)} mag</span>
              </li>
            ))}
          </ul>
          <Link className="sky-rashi-link" href={`/rashi/${selected.slug}`}>
            {t("allRashis")} · {selected.rashi} <ArrowUpRight size={14} />
          </Link>
        </aside>
      </section>

      <section className="sky-signs-section" aria-labelledby="sky-signs-heading">
        <div className="sky-signs-heading">
          <div>
            <p className="rashi-kicker"><Stars size={13} /> {t("allRashis")}</p>
            <h2 id="sky-signs-heading">{t("exploreAllRashis")}</h2>
          </div>
          <span>{zodiacConstellations.length.toString().padStart(2, "0")} signs</span>
        </div>
        <div className="sky-sign-grid">
          {zodiacConstellations.map((constellation, index) => (
            <button
              type="button"
              key={constellation.slug}
              className={`sky-sign-card ${selectedSlug === constellation.slug ? "sky-sign-card-active" : ""}`}
              aria-pressed={selectedSlug === constellation.slug}
              onClick={() => setSelectedSlug(constellation.slug)}
              style={{ "--sky-accent": constellation.palette } as React.CSSProperties}
            >
              <span className="sky-sign-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="sky-sign-symbol">{constellation.symbol}</span>
              <span className="sky-sign-rashi">{constellation.rashi}</span>
              <span className="sky-sign-name">{constellation.name}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="sky-accuracy-note">
        <span className="sky-accuracy-icon"><Sparkles size={15} /></span>
        <p>{t("skyScaleNote")}</p>
      </aside>
      <footer className="sky-footer">
        <span>Star coordinates rounded from the SIMBAD Astronomical Database · J2000</span>
        <a href="https://simbad.cds.unistra.fr/simbad/" target="_blank" rel="noreferrer">
          SIMBAD catalog <ArrowUpRight size={12} />
        </a>
      </footer>
    </main>
  );
}
