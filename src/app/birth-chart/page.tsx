"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, CircleHelp, LockKeyhole, Stars } from "lucide-react";
import { ChartOrbitScene } from "@/app/chart/orbit-scene";
import { calculateBirthChart } from "@/lib/birth-chart";
import type { BirthChart } from "@/lib/birth-chart";
import { chartConcepts, getConcept, houses } from "@/lib/chart-learning";
import { LanguageSelect, useLocale } from "@/lib/locale";

const DASHA_THEMES: Record<string, string> = {
  Ketu: "inward focus, simplification, and letting go",
  Venus: "relationships, art, enjoyment, and refinement",
  Sun: "vitality, purpose, and responsibility",
  Moon: "care, feeling, and changing rhythms",
  Mars: "initiative, effort, and action",
  Rahu: "novelty, ambition, and unfamiliar paths",
  Jupiter: "learning, counsel, and expansion",
  Saturn: "patience, structure, and sustained effort",
  Mercury: "communication, analysis, and exchange",
};

const GRAHA_NAMES: Record<string, string> = {
  "graha-sun": "Sun",
  "graha-moon": "Moon",
  "graha-mars": "Mars",
  "graha-mercury": "Mercury",
  "graha-jupiter": "Jupiter",
  "graha-venus": "Venus",
  "graha-saturn": "Saturn",
  "graha-rahu": "Rahu",
  "graha-ketu": "Ketu",
};

function formatDegrees(degrees: number): string {
  const wholeDegrees = Math.floor(degrees);
  const minutes = Math.floor((degrees - wholeDegrees) * 60);
  return `${wholeDegrees}° ${String(minutes).padStart(2, "0")}′`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

export default function BirthChartPage() {
  const { t } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [selectedId, setSelectedId] = useState(houses[0].id);
  const [errorMessage, setErrorMessage] = useState("");

  const selected = getConcept(selectedId) ?? houses[0];
  const selectedHouse = selected.domain === "house"
    ? Number(selected.id.slice("house-".length))
    : undefined;
  const selectedPlacement = chart && selected.domain === "graha"
    ? chart.placements.find(({ name }) => name === GRAHA_NAMES[selected.id])
    : undefined;
  const highlightedHouse = selectedPlacement?.house ?? selectedHouse;
  const housePlacements = chart && selectedHouse
    ? chart.placements.filter(({ house }) => house === selectedHouse)
    : [];
  const selectedVaaniQuestion = chart
    ? selected.domain === "graha" && selectedPlacement
      ? `My calculated sidereal chart places ${selectedPlacement.name} in ${selectedPlacement.sign}, whole-sign house ${selectedPlacement.house}. What are the general traditional themes and limitations of this placement?`
      : `My calculated chart has ${chart.ascendant.sign} rising. What are the general traditional themes of the ${selected.name}, and what can this not tell me?`
    : selected.question;

  function fillSampleValues() {
    const form = formRef.current;
    if (!form) return;
    const sampleValues = {
      birthDate: "1998-05-15",
      birthTime: "10:30",
      utcOffset: "5.5",
      latitude: "28.6139",
      longitude: "77.2090",
    };
    for (const [name, value] of Object.entries(sampleValues)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement) field.value = value;
    }
  }

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const result = calculateBirthChart({
        localDateTime: `${String(formData.get("birthDate"))}T${String(formData.get("birthTime"))}`,
        utcOffsetHours: Number(formData.get("utcOffset")),
        latitude: Number(formData.get("latitude")),
        longitude: Number(formData.get("longitude")),
      });
      setChart(result);
      setSelectedId("house-1");
      setErrorMessage("");
    } catch (error) {
      setChart(null);
      setErrorMessage(error instanceof Error ? error.message : "The chart could not be calculated.");
    }
  }

  return (
    <main className="rashi-page chart-learning-page birth-chart-page">
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
        <p className="rashi-kicker"><Stars size={13} /> ASTROPEDIA · ON-DEVICE CHART</p>
        <h1>Your chart, calculated in this browser.</h1>
        <p>
          Enter birth time and coordinates to calculate sidereal sign placements,
          whole-sign houses, and a traditional Vimshottari period. Drag the chart
          and select a house or Graha to explore the result.
        </p>
      </section>

      <section className="birth-chart-form-card" aria-labelledby="birth-details-heading">
        <div className="birth-chart-form-heading">
          <div>
            <p className="rashi-kicker"><LockKeyhole size={13} /> YOUR DETAILS STAY HERE</p>
            <h2 id="birth-details-heading">Birth details</h2>
          </div>
          <span>Required only for this calculation</span>
        </div>
        <p className="birth-chart-demo-note">{t("dataDemoNote")}</p>
        <button className="birth-chart-demo-button" type="button" onClick={fillSampleValues}>
          <Stars size={13} /> {t("fillDemoData")}
        </button>
        <form className="birth-chart-form" ref={formRef} onSubmit={calculate}>
          <label>
            <span>Birth date</span>
            <input name="birthDate" type="date" required />
          </label>
          <label>
            <span>Local birth time</span>
            <input name="birthTime" type="time" required />
          </label>
          <label>
            <span>UTC offset at birth (hours)</span>
            <input name="utcOffset" type="number" step="0.25" min="-12" max="14" placeholder="5.5" required />
          </label>
          <label>
            <span>Latitude (−90 to +90)</span>
            <input name="latitude" type="number" step="0.0001" min="-90" max="90" placeholder="28.6139" required />
          </label>
          <label>
            <span>Longitude (−180 to +180)</span>
            <input name="longitude" type="number" step="0.0001" min="-180" max="180" placeholder="77.2090" required />
          </label>
          <button className="birth-chart-submit" type="submit">
            Calculate my chart <ArrowUpRight size={15} />
          </button>
        </form>
        <p className="birth-chart-privacy">
          Date, time, and coordinates are processed only in this browser tab.
          They are not uploaded or saved. Enter the historical UTC offset and
          coordinates for the birthplace; no place lookup is performed.
        </p>
        {errorMessage && <p className="birth-chart-error" role="alert">{errorMessage}</p>}
      </section>

      {chart && (
        <>
          <section className="birth-chart-results" aria-label="Calculated birth chart">
            <div className="chart-wheel-panel">
              <ChartOrbitScene
                selectedId={selectedId}
                selectedSymbol={selected.symbol}
                selectedName={selected.name}
                onSelect={setSelectedId}
                planetPlacements={chart.placements.map(({ name, symbol, house }) => ({ name, symbol, house }))}
                highlightedHouse={highlightedHouse}
              />
              <div className="graha-selector" aria-label="Select a planetary placement">
                {chartConcepts.filter((concept) => concept.domain === "graha").map((graha) => (
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
                Sidereal placements · approximate Lahiri ayanamsa · whole-sign houses
              </p>
            </div>

            <aside className="chart-concept-card birth-chart-detail" aria-live="polite">
              <p className="rashi-kicker"><CircleHelp size={13} /> {selected.domain === "house" ? "YOUR HOUSE" : "YOUR PLACEMENT"}</p>
              <span className="chart-concept-symbol" aria-hidden="true">{selected.symbol}</span>
              <h2>{selected.name}</h2>
              {selectedPlacement ? (
                <div className="birth-chart-placement-detail">
                  <strong>{selectedPlacement.sign} · {formatDegrees(selectedPlacement.degreeInSign)}</strong>
                  <span>Whole-sign house {selectedPlacement.house}</span>
                </div>
              ) : (
                <div className="birth-chart-house-placements">
                  <strong>{chart.ascendant.sign} rising · House {selectedHouse}</strong>
                  {housePlacements.length ? housePlacements.map((placement) => (
                    <span key={placement.name}>{placement.symbol} {placement.name} in {placement.sign}</span>
                  )) : <span>No Navagraha placements in this house.</span>}
                </div>
              )}
              <p>
                These are calculated positions interpreted through a traditional
                framework, not scientifically validated predictions.
              </p>
              <Link className="rashi-ask-link" href={`/?question=${encodeURIComponent(selectedVaaniQuestion)}#ask`}>
                Ask Vaani about this placement <ArrowUpRight size={14} />
              </Link>
            </aside>
          </section>

          <section className="birth-chart-period">
            <p className="rashi-kicker"><Stars size={13} /> VIMSHOTTARI · TRADITIONAL TIMING SYSTEM</p>
            {chart.currentDasha ? (
              <>
                <h2>{chart.currentDasha.lord} Mahadasha</h2>
                <p>
                  The Moon falls in {chart.moonNakshatra}; this simplified
                  Vimshottari calculation places the current period from{" "}
                  {formatDate(chart.currentDasha.start)} to {formatDate(chart.currentDasha.end)}.
                  Traditional themes include {DASHA_THEMES[chart.currentDasha.lord]}.
                  Use this as a reflection prompt, not a forecast or life advice.
                </p>
              </>
            ) : (
              <p>
                The Moon falls in {chart.moonNakshatra}, but this simplified
                period calculation could not identify the current period.
              </p>
            )}
          </section>

          <details className="birth-chart-method">
            <summary>Calculation method and limits</summary>
            <p>
              Planetary longitudes use the Astronomy Engine ephemeris in this
              browser. Signs are calculated with a linear Lahiri-style ayanamsa
              approximation; houses use whole signs from the calculated
              ascendant; Rahu/Ketu use the mean lunar node. Vimshottari periods
              use the Moon&apos;s nakshatra and a 365.2425-day year. This is a
              transparent educational implementation, not a professionally
              certified ephemeris or a deterministic prediction.
            </p>
          </details>
        </>
      )}

      {!chart && (
        <p className="birth-chart-empty">
          Your chart appears here after calculation. No sample placements are
          shown as if they were yours.
        </p>
      )}
      <footer className="rashi-footer chart-learning-footer">
        <span>Birth data remains in this page&apos;s memory and is cleared when you leave or refresh.</span>
        <span>Made by Grisha Lala</span>
      </footer>
    </main>
  );
}
