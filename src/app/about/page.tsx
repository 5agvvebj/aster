import Link from "next/link";
import { ArrowLeft, LockKeyhole, Stars } from "lucide-react";
import { LanguageSelect } from "@/lib/locale";

export const metadata = {
  title: "About Aster — a reflective astrology demo",
  description: "Learn about Aster's educational scope, data handling, and limitations.",
};

export default function AboutPage() {
  return (
    <main className="rashi-page about-page">
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/">
          <ArrowLeft size={15} /> Back to your space
        </Link>
        <div className="rashi-header-actions">
          <Link className="rashi-brand" href="/"><Stars size={15} /> aster</Link>
          <LanguageSelect />
        </div>
      </header>
      <section className="about-card">
        <p className="rashi-kicker"><LockKeyhole size={13} /> ABOUT THIS DEMO</p>
        <h1>A calmer way to explore.</h1>
        <p className="about-lede">
          Aster is an independent educational prototype built for the Melooha
          Engineering Challenge. It is not affiliated with Melooha.
        </p>
        <div className="about-section" id="sources">
          <h2>Evidence before confidence</h2>
          <p>
            For answers, the server retrieves a small set of reviewed reference
            notes. An AI provider may select among those notes, but the
            application validates the selection and writes the answer from the
            stored facts. When no evidence supports an answer, the app declines
            rather than inventing details.
          </p>
        </div>
        <div className="about-section">
          <h2>Educational scope and privacy</h2>
          <p>
            The optional birth-chart page calculates approximate placements in
            your browser tab; birth details are not uploaded or saved. The scan
            lab detects face or hand landmarks locally after camera permission,
            but does not analyze palm lines or predict personality, health, or
            future events. Guest Q&A activity is associated with a signed,
            browser-held demo session and stored by the local application
            database.
          </p>
        </div>
        <div className="about-section">
          <h2>Developer</h2>
          <p>Made by Grisha Lala</p>
        </div>
        <Link className="about-return" href="/rashi">Explore the twelve Rashis</Link>
      </section>
    </main>
  );
}
