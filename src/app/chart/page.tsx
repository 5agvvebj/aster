"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, CircleHelp, Stars } from "lucide-react";
import { grahas, houses } from "@/lib/chart-learning";
import { ChartOrbitScene } from "./orbit-scene";
import { LanguageSelect } from "@/lib/locale";

export default function ChartLearningPage() {
  const [selectedId, setSelectedId] = useState(houses[0].id);
  const selected = [...houses, ...grahas].find((concept) => concept.id === selectedId) ?? houses[0];

  return (
    <main className="rashi-page chart-learning-page">
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/">
          <ArrowLeft size={15} /> Back to your space
        </Link>
        <div className="rashi-header-actions">
          <Link className="rashi-brand" href="/"><Stars size={15} /> aster</Link>
          <LanguageSelect />
        </div>
      </header>

      <section className="chart-learning-hero">
        <p className="rashi-kicker"><Stars size={13} /> ASTROPEDIA · CHART LEARNING</p>
        <h1>Step inside the chart.</h1>
        <p>
          Rotate a three-dimensional chart model and explore houses or Grahas.
          Each selection opens its traditional themes and a question for Vaani.
        </p>
      </section>

      <section className="chart-learning-layout" aria-label="Interactive chart concepts">
        <div className="chart-wheel-panel">
          <ChartOrbitScene
            selectedId={selectedId}
            selectedSymbol={selected.symbol}
            selectedName={selected.name}
            onSelect={setSelectedId}
          />
          <div className="graha-selector" aria-label="Select a Graha">
            {grahas.map((graha) => (
              <button
                className={`graha-chip ${selectedId === graha.id ? "graha-chip-active" : ""}`}
                key={graha.id}
                type="button"
                aria-pressed={selectedId === graha.id}
                onClick={() => setSelectedId(graha.id)}
              >
                <span>{graha.symbol}</span>{graha.name}
              </button>
            ))}
          </div>
          <p className="chart-diagram-note">
            Interactive educational model only · no personal placements or birth data are shown
          </p>
        </div>

        <aside className="chart-concept-card" aria-live="polite">
          <p className="rashi-kicker"><CircleHelp size={13} /> {selected.domain === "house" ? "HOUSE CONCEPT" : "NAVAGRAHA CONCEPT"}</p>
          <span className="chart-concept-symbol" aria-hidden="true">{selected.symbol}</span>
          <h2>{selected.name}</h2>
          <p>{selected.summary}</p>
          <div className="chart-context-boundary">
            <strong>What this demo knows</strong>
            <span>Only this educational concept. Personal birth-chart placements are not calculated.</span>
          </div>
          <Link className="rashi-ask-link" href={`/?question=${encodeURIComponent(selected.question)}#ask`}>
            Ask Vaani about this concept <ArrowUpRight size={14} />
          </Link>
        </aside>
      </section>

      <footer className="rashi-footer chart-learning-footer">
        <span>3D visualization is illustrative; it does not calculate personal placements.</span>
        <span>Made by Grisha Lala</span>
      </footer>
    </main>
  );
}
