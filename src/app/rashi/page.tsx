import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Compass, Stars } from "lucide-react";
import type { CSSProperties } from "react";
import { rashis } from "@/lib/rashis";
import { PlanetaryGalaxy } from "./[slug]/orbit";
import { LanguageSelect } from "@/lib/locale";

export const metadata = {
  title: "Rashi Explorer — Aster",
  description: "Explore the twelve Rashis and their traditional Vedic associations.",
};

export default function RashiExplorerPage() {
  return (
    <main className="rashi-page">
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/">
          <ArrowLeft size={15} /> Back to your space
        </Link>
        <div className="rashi-header-actions">
          <span className="rashi-brand"><Stars size={15} /> aster</span>
          <LanguageSelect />
        </div>
      </header>

      <section className="rashi-intro">
        <div className="rashi-intro-copy">
          <p className="rashi-kicker"><Compass size={13} /> A TRADITIONAL VEDIC ASTROLOGY GUIDE</p>
          <h1>Meet the twelve Rashis.</h1>
          <p>
            Explore the signs as a symbolic language for reflection. These
            traditional associations are educational—not a personal chart
            reading or a prediction.
          </p>
        </div>
        <PlanetaryGalaxy />
      </section>

      <section className="rashi-exploration-links" aria-label="More daily sky exploration">
        <Link href="/sky" className="rashi-exploration-card">
          <span className="rashi-exploration-icon"><Stars size={17} /></span>
          <span><strong>Explore the constellation sky</strong><small>Rotate the star atlas and select any Rashi</small></span>
          <ArrowUpRight size={15} />
        </Link>
        <Link href="/panchang" className="rashi-exploration-card">
          <span className="rashi-exploration-icon"><Compass size={17} /></span>
          <span>          <strong>Today&apos;s Panchang</strong><small>Local sunrise and traditional calendar markers</small></span>
          <ArrowUpRight size={15} />
        </Link>
      </section>

      <section aria-label="All twelve Rashis" className="rashi-grid">
        {rashis.map((rashi, index) => (
          <Link
            className="rashi-card"
            href={`/rashi/${rashi.slug}`}
            key={rashi.slug}
            style={{ "--rashi-accent": rashi.palette } as CSSProperties}
          >
            <div className="rashi-card-top">
              <span className="rashi-card-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="rashi-glyph" aria-hidden="true">{rashi.symbol}</span>
              <ArrowUpRight className="rashi-card-arrow" size={16} aria-hidden="true" />
            </div>
            <h2>{rashi.sanskritName}</h2>
            <p className="rashi-english-name">{rashi.name}</p>
            <p className="rashi-card-summary">{rashi.summary}</p>
            <div className="rashi-card-meta">
              <span>{rashi.ruler}</span>
              <span>{rashi.element}</span>
            </div>
            <span className="rashi-card-action">Explore sign <ArrowUpRight size={13} /></span>
          </Link>
        ))}
      </section>

      <footer className="rashi-footer">
        <span>Rulership and qualities follow a traditional Parashari sign convention.</span>
        <span>Made by Grisha Lala</span>
      </footer>
    </main>
  );
}
