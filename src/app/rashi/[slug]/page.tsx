import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles, Stars } from "lucide-react";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { rashis, getRashi } from "@/lib/rashis";
import { RashiOrbit } from "./orbit";
import { LanguageSelect } from "@/lib/locale";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return rashis.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const rashi = getRashi(slug);
  return {
    title: rashi ? `${rashi.sanskritName} (${rashi.name}) — Aster` : "Rashi — Aster",
    description: rashi?.summary ?? "Explore a traditional Vedic astrology sign.",
  };
}

async function RashiDetailContent({ params }: Props) {
  const { slug } = await params;
  const index = rashis.findIndex((rashi) => rashi.slug === slug);
  const rashi = getRashi(slug);
  if (!rashi || index < 0) notFound();

  const previous = rashis[(index + rashis.length - 1) % rashis.length];
  const next = rashis[(index + 1) % rashis.length];

  return (
    <main className="rashi-page rashi-detail-page" style={{ "--rashi-accent": rashi.palette } as CSSProperties}>
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/rashi">
          <ArrowLeft size={15} /> All Rashis
        </Link>
        <div className="rashi-header-actions">
          <Link className="rashi-brand" href="/"><Stars size={15} /> aster</Link>
          <LanguageSelect />
        </div>
      </header>

      <section className="rashi-detail-hero">
        <div className="rashi-detail-copy">
          <p className="rashi-kicker"><span className="rashi-kicker-dot" /> SIGN {String(index + 1).padStart(2, "0")} OF 12</p>
          <p className="rashi-detail-symbol" aria-hidden="true">{rashi.symbol}</p>
          <h1>{rashi.sanskritName}<span>{rashi.name}</span></h1>
          <p className="rashi-detail-summary">{rashi.summary}</p>
          <div className="rashi-detail-tags">
            <span>{rashi.element} element</span>
            <span>{rashi.modality} quality</span>
            <span>Ruled by {rashi.ruler}</span>
          </div>
          <Link className="rashi-ask-link" href={`/?question=${encodeURIComponent(rashi.question)}#ask`}>
            Ask about {rashi.sanskritName} <ArrowUpRight size={15} />
          </Link>
        </div>
        <RashiOrbit rashi={rashi} />
      </section>

      <section className="rashi-content-grid">
        <article className="rashi-content-card">
          <p className="rashi-kicker">TRADITIONAL THEMES</p>
          <h2>A symbolic lens, not a label.</h2>
          <p>
            In Vedic astrology, a Rashi is one part of a larger chart. Its
            traditional themes are interpreted alongside planetary placements,
            relationships between chart factors, and the chosen calculation
            convention. A sign alone cannot describe an individual.
          </p>
          <div className="rashi-quality-list">
            {rashi.qualities.map((quality) => (
              <span key={quality}><Sparkles size={12} /> {quality}</span>
            ))}
          </div>
        </article>
        <article className="rashi-reflection-card">
          <p className="rashi-kicker"><Stars size={12} /> A QUESTION TO REFLECT ON</p>
          <blockquote>{rashi.reflection}</blockquote>
          <p>This prompt is for personal reflection—not a prediction about what will happen.</p>
        </article>
      </section>

      <nav className="rashi-pagination" aria-label="Browse Rashis">
        <Link href={`/rashi/${previous.slug}`} className="rashi-page-link">
          <ArrowLeft size={15} /><span><small>PREVIOUS</small><strong>{previous.sanskritName}</strong></span>
        </Link>
        <Link href="/rashi" className="rashi-index-link">Explore all 12</Link>
        <Link href={`/rashi/${next.slug}`} className="rashi-page-link rashi-page-link-next">
          <span><small>NEXT</small><strong>{next.sanskritName}</strong></span><ArrowRight size={15} />
        </Link>
      </nav>
      <p className="rashi-detail-note">
        <Stars size={13} /> Rulership follows a traditional Parashari sign convention.
        The NASA-photo galaxy is an artistic, not-to-scale visualization and does not show a personal chart placement.
      </p>
    </main>
  );
}

export default function RashiDetailPage({ params }: Props) {
  return (
    <Suspense fallback={
      <main className="rashi-page rashi-loading" role="status">
        <p className="rashi-kicker"><Stars size={13} /> OPENING THE RASHI GUIDE</p>
        <p>Loading this sign…</p>
      </main>
    }>
      <RashiDetailContent params={params} />
    </Suspense>
  );
}
