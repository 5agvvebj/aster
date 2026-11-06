"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole, Stars } from "lucide-react";
import type { CSSProperties } from "react";
import { LanguageSelect, useLocale } from "@/lib/locale";

const tokens = [
  { name: "Ink", value: "#271f2d", use: "Primary text" },
  { name: "Muted", value: "#857c88", use: "Secondary text" },
  { name: "Paper", value: "#f7f4f0", use: "Page background" },
  { name: "Surface", value: "#fffdfa", use: "Cards and controls" },
  { name: "Plum", value: "#6a3d67", use: "Primary action" },
  { name: "Deep plum", value: "#18121d", use: "Navigation" },
  { name: "Lilac", value: "#ddc3dc", use: "Cosmic accents" },
  { name: "Gold", value: "#d3a66a", use: "Warm highlight" },
  { name: "Green", value: "#587d69", use: "Positive status" },
];

export default function StyleGuidePage() {
  const { t } = useLocale();

  return (
    <main className="rashi-page style-guide-page">
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/">
          <ArrowLeft size={15} /> {t("backHome")}
        </Link>
        <div className="rashi-header-actions">
          <span className="rashi-brand"><Stars size={15} /> aster</span>
          <LanguageSelect />
        </div>
      </header>

      <section className="style-guide-hero">
        <p className="rashi-kicker"><Stars size={13} /> ASTER · UI FOUNDATIONS</p>
        <h1>{t("styleGuide")}</h1>
        <p>
          A calm editorial canvas, warm paper surfaces, and restrained celestial
          color. Components should keep evidence and limitations easy to see.
        </p>
      </section>

      <section className="style-guide-section" aria-labelledby="tokens-heading">
        <div className="style-guide-section-heading">
          <span>01</span>
          <div><h2 id="tokens-heading">Color tokens</h2><p>Shared CSS custom properties from the app root.</p></div>
        </div>
        <div className="style-token-grid">
          {tokens.map((token) => (
            <article className="style-token-card" key={token.name}>
              <span className="style-token-swatch" style={{ "--token-color": token.value } as CSSProperties} />
              <div><strong>{token.name}</strong><span>{token.value}</span><small>{token.use}</small></div>
            </article>
          ))}
        </div>
      </section>

      <section className="style-guide-section" aria-labelledby="type-heading">
        <div className="style-guide-section-heading">
          <span>02</span>
          <div><h2 id="type-heading">Type and hierarchy</h2><p>Serif display headlines; clean sans-serif for reading and controls.</p></div>
        </div>
        <article className="style-type-sample">
          <p className="rashi-kicker">DISPLAY · GEORGIA · REGULAR</p>
          <h2>Big questions, gently explored.</h2>
          <p>Body text stays readable at small sizes, with a generous line height for long answers and educational notes.</p>
          <span>LABEL · 9–11px · TRACKED · MUTED</span>
        </article>
      </section>

      <section className="style-guide-section" aria-labelledby="components-heading">
        <div className="style-guide-section-heading">
          <span>03</span>
          <div><h2 id="components-heading">Components and states</h2><p>Reuse the same visual language across questions, charts, and daily tools.</p></div>
        </div>
        <div className="style-component-grid">
          <article className="style-component-card">
            <p className="section-kicker">ACTION</p>
            <button type="button" className="style-primary-button">Explore answer <ArrowUpRight size={14} /></button>
            <button type="button" className="style-secondary-button">Open evidence <Check size={14} /></button>
          </article>
          <article className="style-component-card">
            <p className="section-kicker">QUESTION FIELD</p>
            <label className="style-sample-label" htmlFor="style-sample">Your question</label>
            <textarea id="style-sample" readOnly value="What does a birth chart represent?" />
          </article>
          <article className="style-component-card style-evidence-sample">
            <p className="section-kicker"><LockKeyhole size={12} /> GROUNDED ANSWER</p>
            <p>A reviewed note is shown with its source. If support is missing, the interface says so instead of inventing an answer.</p>
            <span>Evidence visible · Educational scope</span>
          </article>
        </div>
      </section>

      <section className="style-guide-principles">
        <h2>Interaction principles</h2>
        <ul>
          <li>Give every action a clear label and keyboard focus state.</li>
          <li>Keep mobile tap targets comfortable and layouts free of horizontal overflow.</li>
          <li>Use motion to clarify spatial relationships; honor reduced-motion preferences.</li>
          <li>Separate traditional interpretation from astronomical measurements.</li>
          <li>Show evidence, data limitations, and privacy boundaries close to the feature.</li>
        </ul>
      </section>
    </main>
  );
}
