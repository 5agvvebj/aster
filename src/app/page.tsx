"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  CircleHelp,
  Compass,
  Gem,
  History,
  LockKeyhole,
  Mic,
  Menu,
  MessageCircle,
  Plus,
  Sparkles,
  Stars,
  Sun,
  Volume2,
  X,
} from "lucide-react";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getDiscoveryRecommendation } from "@/lib/discovery";
import { LanguageSelect, useLocale, type Locale } from "@/lib/locale";

type SpeechRecognitionResult = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResult) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type EvidenceFact = {
  id: string;
  topic: string;
  content: string;
  sourceLabel: string;
  sourceUrl: string | null;
};

type HistoryItem = {
  id: string;
  question: string;
  status: "completed" | "insufficient_evidence";
  answerText: string;
  locale: "en" | "hi" | "es" | "fr" | "de" | "pt";
  provider: "gemini" | "groq" | "curated";
  createdAt: string;
  saved: boolean;
  evidence: EvidenceFact[];
  summary: string | null;
  jobStatus: "pending" | "running" | "completed" | "failed" | null;
};

const apiErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});
const streamMetadataSchema = z.object({
  answerId: z.string().uuid(),
  status: z.enum(["completed", "insufficient_evidence"]),
  provider: z.enum(["gemini", "groq", "curated"]),
  balance: z.number().int().nonnegative(),
});
const streamDeltaSchema = z.object({ text: z.string() });
const streamEvidenceSchema = z.object({ facts: z.array(z.object({
  id: z.string(),
  topic: z.string(),
  content: z.string(),
  sourceLabel: z.string(),
  sourceUrl: z.string().nullable(),
})) });

const suggestionIcons = [Compass, Sparkles, MessageCircle, Sun] as const;
const suggestedQuestionCopy: Record<Locale, { category: string; question: string }[]> = {
  en: [
    { category: "THE BASICS", question: "What is a birth chart, and what can it tell me?" },
    { category: "PLANETS", question: "What does it mean when a planet is in retrograde?" },
    { category: "RELATIONSHIPS", question: "How do astrologers approach compatibility?" },
    { category: "TIMING", question: "What is a dasha period in Vedic astrology?" },
  ],
  hi: [
    { category: "मूल बातें", question: "जन्म कुंडली क्या होती है?" },
    { category: "ग्रह", question: "ग्रह की वक्री गति का क्या अर्थ है?" },
    { category: "रिश्ते", question: "ज्योतिष में अनुकूलता को कैसे समझते हैं?" },
    { category: "समय", question: "वैदिक ज्योतिष में दशा अवधि क्या है?" },
  ],
  es: [
    { category: "CONCEPTOS", question: "¿Qué es una carta natal y qué puede mostrar?" },
    { category: "PLANETAS", question: "¿Qué significa que un planeta esté retrógrado?" },
    { category: "RELACIONES", question: "¿Cómo se interpreta la compatibilidad astrológica?" },
    { category: "PERIODOS", question: "¿Qué es un periodo dasha en la astrología védica?" },
  ],
  fr: [
    { category: "LES BASES", question: "Qu’est-ce qu’un thème natal et que peut-il montrer ?" },
    { category: "PLANÈTES", question: "Que signifie le mouvement rétrograde d’une planète ?" },
    { category: "RELATIONS", question: "Comment l’astrologie aborde-t-elle la compatibilité ?" },
    { category: "PÉRIODES", question: "Qu’est-ce qu’une période Dasha en astrologie védique ?" },
  ],
  de: [
    { category: "GRUNDLAGEN", question: "Was ist ein Geburtshoroskop und was zeigt es?" },
    { category: "PLANETEN", question: "Was bedeutet es, wenn ein Planet rückläufig ist?" },
    { category: "BEZIEHUNGEN", question: "Wie deutet die Astrologie Kompatibilität?" },
    { category: "ZEITRÄUME", question: "Was ist eine Dasha-Periode in der vedischen Astrologie?" },
  ],
  pt: [
    { category: "CONCEITOS", question: "O que é um mapa natal e o que ele pode mostrar?" },
    { category: "PLANETAS", question: "O que significa um planeta estar retrógrado?" },
    { category: "RELACIONAMENTOS", question: "Como a astrologia interpreta a compatibilidade?" },
    { category: "PERÍODOS", question: "O que é um período dasha na astrologia védica?" },
  ],
};

function BrandMark() {
  return (
    <div className="brand-lockup" aria-label="Aster, a reflective astrology companion">
      <span className="brand-mark" aria-hidden="true">
        <Stars size={17} strokeWidth={1.6} />
      </span>
      <span className="brand-name">aster</span>
      <span className="brand-period" aria-hidden="true">
        .
      </span>
    </div>
  );
}

function CelestialOrb() {
  return (
    <div className="orb-scene" role="img" aria-label="An animated celestial globe surrounded by orbital rings">
      <div className="orb-halo orb-halo-one" />
      <div className="orb-halo orb-halo-two" />
      <div className="orb-ring orb-ring-back" />
      <div className="orb-core">
        <span className="orb-light" />
        <span className="orb-continent continent-one" />
        <span className="orb-continent continent-two" />
        <span className="orb-continent continent-three" />
        <span className="orb-shimmer" />
      </div>
      <div className="orb-ring orb-ring-front" />
      <span className="orb-satellite satellite-one" />
      <span className="orb-satellite satellite-two" />
      <span className="orb-star orb-star-one">✦</span>
      <span className="orb-star orb-star-two">✧</span>
    </div>
  );
}

export default function Home() {
  const { locale, t } = useLocale();
  const [question, setQuestion] = useState("");
  const [answerVisible, setAnswerVisible] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [answerId, setAnswerId] = useState<string | null>(null);
  const [answerLocale, setAnswerLocale] = useState<Locale>("en");
  const [answerText, setAnswerText] = useState("");
  const [answerProvider, setAnswerProvider] = useState<"gemini" | "groq" | "curated" | null>(null);
  const [evidence, setEvidence] = useState<EvidenceFact[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpMessage, setTopUpMessage] = useState("");
  const [topUpError, setTopUpError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const speechRecognition = useRef<BrowserSpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const discoveryRecommendation = getDiscoveryRecommendation(
    history.slice(0, 5).map((item) => item.question),
  );
  const suggestedQuestions = suggestedQuestionCopy[locale].map((suggestion, index) => ({
    ...suggestion,
    icon: suggestionIcons[index],
  }));

  async function refreshHistory() {
    const response = await fetch("/api/history");
    if (!response.ok) throw new Error("Recent questions could not be loaded.");
    const result = await response.json();
    const parsed = z.object({ answers: z.array(z.object({
      id: z.string(),
      question: z.string(),
      status: z.enum(["completed", "insufficient_evidence"]),
      answerText: z.string(),
      locale: z.enum(["en", "hi", "es", "fr", "de", "pt"]),
      provider: z.enum(["gemini", "groq", "curated"]),
      createdAt: z.string(),
      saved: z.boolean(),
      evidence: z.array(streamEvidenceSchema.shape.facts.element),
      summary: z.string().nullable(),
      jobStatus: z.enum(["pending", "running", "completed", "failed"]).nullable(),
    })) }).safeParse(result);
    if (!parsed.success) throw new Error("Recent questions returned an unexpected response.");
    setHistory(parsed.data.answers);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const suggestedQuestion = new URLSearchParams(window.location.search).get("question");
      if (suggestedQuestion) setQuestion(suggestedQuestion.slice(0, 500));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const loadPageData = async () => {
      try {
        const sessionResponse = await fetch("/api/session");
        if (!sessionResponse.ok) {
          throw new Error("The demo service could not be reached.");
        }
        const sessionResult = await sessionResponse.json();
        const parsedSession = z.object({ balance: z.number().int().nonnegative() }).safeParse(sessionResult);
        const historyResponse = await fetch("/api/history");
        if (!historyResponse.ok) {
          throw new Error("The demo service could not be reached.");
        }
        const historyResult = await historyResponse.json();
        const parsedHistory = z.object({ answers: z.array(z.object({
          id: z.string(),
          question: z.string(),
          status: z.enum(["completed", "insufficient_evidence"]),
          answerText: z.string(),
          locale: z.enum(["en", "hi", "es", "fr", "de", "pt"]),
          provider: z.enum(["gemini", "groq", "curated"]),
          createdAt: z.string(),
          saved: z.boolean(),
          evidence: z.array(streamEvidenceSchema.shape.facts.element),
          summary: z.string().nullable(),
          jobStatus: z.enum(["pending", "running", "completed", "failed"]).nullable(),
        })) }).safeParse(historyResult);
        if (!parsedSession.success || !parsedHistory.success) {
          throw new Error("The demo service returned an unexpected response.");
        }
        if (active) {
          setBalance(parsedSession.data.balance);
          setHistory(parsedHistory.data.answers);
          const answerIdFromJourney = new URLSearchParams(window.location.search).get("answer");
          const journeyAnswer = parsedHistory.data.answers.find((item) => item.id === answerIdFromJourney);
          if (journeyAnswer) {
            setQuestion(journeyAnswer.question);
            setAnswerId(journeyAnswer.id);
            setAnswerLocale(journeyAnswer.locale);
            setAnswerText(journeyAnswer.answerText);
            setHasEvidence(journeyAnswer.status === "completed");
            setAnswerProvider(journeyAnswer.provider);
            setEvidence(journeyAnswer.evidence);
            setAnswerVisible(true);
            setIsSaved(journeyAnswer.saved);
            setShowEvidence(false);
            window.setTimeout(() => {
              document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" });
            }, 0);
          }
          setIsOffline(false);
          setErrorMessage("");
        }
      } catch {
        if (active) {
          setIsOffline(!navigator.onLine);
          setErrorMessage("We couldn’t load your demo space. Check that the local app and database are running.");
        }
      }
    };

    void loadPageData();
    const handleOnline = () => {
      setIsOffline(false);
      void loadPageData();
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => () => {
    speechRecognition.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  function toggleVoiceInput() {
    if (isListening) {
      speechRecognition.current?.stop();
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setErrorMessage("Voice input is not supported in this browser. You can still type your question.");
      return;
    }

    setErrorMessage("");
    const recognition = new Recognition();
    recognition.lang = `${locale}-${locale === "en" ? "US" : locale === "hi" ? "IN" : locale === "pt" ? "BR" : locale.toUpperCase()}`;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript;
      if (transcript) setQuestion(transcript.slice(0, 500));
    };
    recognition.onerror = (event) => {
      setErrorMessage(event.error === "not-allowed"
        ? "Microphone permission was denied. Allow microphone access or type your question."
        : "Voice input stopped unexpectedly. Please try again or type your question.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    speechRecognition.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setErrorMessage("The microphone could not be started. Please type your question instead.");
    }
  }

  function speakAnswer() {
    if (!answerText || !window.speechSynthesis) {
      setErrorMessage("Spoken answers are not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answerText);
    utterance.lang = `${answerLocale}-${answerLocale === "en" ? "US" : answerLocale === "hi" ? "IN" : answerLocale === "pt" ? "BR" : answerLocale.toUpperCase()}`;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      if (event.error === "interrupted" || event.error === "canceled") return;
      setErrorMessage("The spoken answer could not be played. You can still read the response.");
    };
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    const hasPendingSavedInsight = history.some(
      (item) => item.saved && (item.jobStatus === "pending" || item.jobStatus === "running"),
    );
    if (!hasPendingSavedInsight) return;

    const timer = window.setInterval(() => {
      void refreshHistory().catch(() => {
        setErrorMessage("Your saved insight is safe, but its summary status could not be refreshed.");
      });
    }, 2_000);
    return () => window.clearInterval(timer);
  }, [history]);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    if (balance !== null && balance < 1) {
      setTopUpOpen(true);
      setTopUpError("You’re out of demo questions. Add a few more to continue.");
      return;
    }

    setErrorMessage("");
    setAnswerLocale(locale);
    setAnswerVisible(true);
    setAnswerId(null);
    setAnswerText("");
    setEvidence([]);
    setAnswerProvider(null);
    setIsLoading(true);
    setHasEvidence(false);
    setShowEvidence(false);
    setIsSaved(false);
    const requestId = crypto.randomUUID();

    try {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId, domain: "vedic_astrology", question: question.trim(), locale }),
      });

      if (!response.ok) {
        const result: unknown = await response.json();
        const parsed = apiErrorSchema.safeParse(result);
        const message = parsed.success
          ? parsed.data.error.message
          : "We couldn’t complete that question. Please try again.";
        if (response.status === 402) {
          setTopUpError(message);
          setTopUpOpen(true);
          setAnswerVisible(false);
          return;
        }
        throw new Error(message);
      }
      if (!response.body) throw new Error("The answer stream could not be opened.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const separatorIndex = buffer.indexOf("\n\n");
          if (separatorIndex < 0) break;
          const eventBlock = buffer.slice(0, separatorIndex);
          buffer = buffer.slice(separatorIndex + 2);
          const eventName = eventBlock.match(/^event: ([\w-]+)$/m)?.[1];
          const dataLine = eventBlock.split("\n").find((line) => line.startsWith("data: "));
          if (!eventName || !dataLine) continue;
          const data: unknown = JSON.parse(dataLine.slice(6));

          if (eventName === "metadata") {
            const parsed = streamMetadataSchema.safeParse(data);
            if (!parsed.success) throw new Error("The answer stream returned invalid metadata.");
            setAnswerId(parsed.data.answerId);
            setHasEvidence(parsed.data.status === "completed");
            setAnswerProvider(parsed.data.provider);
            setBalance(parsed.data.balance);
          } else if (eventName === "delta") {
            const parsed = streamDeltaSchema.safeParse(data);
            if (!parsed.success) throw new Error("The answer stream returned invalid text.");
            setAnswerText((current) => current + parsed.data.text);
          } else if (eventName === "evidence") {
            const parsed = streamEvidenceSchema.safeParse(data);
            if (!parsed.success) throw new Error("The answer stream returned invalid evidence.");
            setEvidence(parsed.data.facts);
          } else if (eventName === "done") {
            completed = true;
          }
        }
      }
      if (!completed) throw new Error("The answer stream ended unexpectedly.");
      await refreshHistory();
      setIsOffline(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t reach the answer service. Please try again.",
      );
      setAnswerVisible(false);
      setIsOffline(!navigator.onLine);
    } finally {
      setIsLoading(false);
    }
  }

  async function addDemoQuestions() {
    setTopUpError("");
    setIsTopUpLoading(true);
    try {
      const response = await fetch("/api/credits/top-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId: crypto.randomUUID() }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const parsed = apiErrorSchema.safeParse(result);
        throw new Error(parsed.success ? parsed.data.error.message : "The demo top-up failed.");
      }
      const parsed = z.object({ balance: z.number().int().nonnegative(), added: z.number().int() }).safeParse(result);
      if (!parsed.success) throw new Error("The top-up returned an unexpected response.");
      setBalance(parsed.data.balance);
      setTopUpMessage(`${parsed.data.added} demo questions added. No payment was made.`);
      setTopUpOpen(false);
      window.setTimeout(() => setTopUpMessage(""), 5000);
    } catch (error) {
      setTopUpError(
        error instanceof Error ? error.message : "The demo top-up failed. Please try again.",
      );
    } finally {
      setIsTopUpLoading(false);
    }
  }

  async function toggleSavedInsight() {
    if (!answerId || isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/saved/${answerId}`, {
        method: isSaved ? "DELETE" : "PUT",
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const parsed = apiErrorSchema.safeParse(result);
        throw new Error(parsed.success ? parsed.data.error.message : "The saved insight could not be updated.");
      }
      const saved = z.object({ saved: z.boolean() }).parse(result).saved;
      setIsSaved(saved);
      setHistory((items) => items.map((item) => item.id === answerId
        ? {
          ...item,
          saved,
          jobStatus: saved ? "pending" : item.jobStatus,
        }
        : item));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The saved insight could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  function openHistoryItem(item: HistoryItem) {
    setQuestion(item.question);
    setAnswerId(item.id);
    setAnswerLocale(item.locale);
    setAnswerText(item.answerText);
    setHasEvidence(item.status === "completed");
    setAnswerProvider(item.provider);
    setEvidence(item.evidence);
    setAnswerVisible(true);
    setIsSaved(item.saved);
    setErrorMessage("");
    setShowEvidence(false);
    document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <BrandMark />
          <button
            className="icon-button mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">{t("workspace")}</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <a className="nav-item nav-item-active" href="#ask" aria-current="page">
            <Sparkles size={17} />
            <span>{t("navAsk")}</span>
            <span className="nav-active-dot" />
          </a>
          <a className="nav-item" href="#discover">
            <Compass size={17} />
            <span>{t("navDiscover")}</span>
          </a>
          <Link
            className="nav-item"
            href="/rashi"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Stars size={17} />
            <span>{t("navRashi")}</span>
          </Link>
          <Link className="nav-item" href="/sky" onClick={() => setMobileMenuOpen(false)}>
            <Stars size={17} />
            <span>{t("navSky")}</span>
          </Link>
          <Link className="nav-item" href="/panchang" onClick={() => setMobileMenuOpen(false)}>
            <Sun size={17} />
            <span>{t("navCalendar")}</span>
          </Link>
          <Link className="nav-item" href="/style-guide" onClick={() => setMobileMenuOpen(false)}>
            <Stars size={17} />
            <span>{t("styleGuide")}</span>
          </Link>
          <Link className="nav-item" href="/chart" onClick={() => setMobileMenuOpen(false)}>
            <Compass size={17} />
            <span>{t("navChart")}</span>
          </Link>
          <Link className="nav-item" href="/birth-chart" onClick={() => setMobileMenuOpen(false)}>
            <Sun size={17} />
            <span>{t("navBirthChart")}</span>
          </Link>
          <Link className="nav-item" href="/scan" onClick={() => setMobileMenuOpen(false)}>
            <LockKeyhole size={17} />
            <span>{t("navScan")}</span>
          </Link>
          <Link className="nav-item" href="/journey" onClick={() => setMobileMenuOpen(false)}>
            <Clock3 size={17} />
            <span>{t("navJourney")}</span>
          </Link>
          <a className="nav-item" href="#saved">
            <Bookmark size={17} />
            <span>{t("navSaved")}</span>
            {history.filter((item) => item.saved).length > 0 && (
              <span className="nav-count">{history.filter((item) => item.saved).length}</span>
            )}
          </a>
          <a className="nav-item" href="#history">
            <History size={17} />
            <span>{t("navHistory")}</span>
          </a>
        </nav>

        <div className="sidebar-divider" />
        <div className="workspace-label">{t("navDiscover")}</div>
        <div className="journey-card">
          <div className="journey-card-icon">
            <Gem size={15} />
          </div>
          <p className="journey-card-title">A little more clarity, whenever you need it.</p>
          <p className="journey-card-copy">
            Your questions are yours. Take your time exploring.
          </p>
          <button className="journey-link" onClick={() => setTopUpOpen(true)}>
            Get demo questions <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="sidebar-bottom">
          <LanguageSelect />
          <div className="privacy-note">
            <LockKeyhole size={14} />
            <span>A private space to reflect</span>
          </div>
          <Link className="profile-button" href="/about" aria-label="About this demo">
            <span className="profile-avatar">S</span>
            <span className="profile-details">
              <span className="profile-name">Your demo space</span>
              <span className="profile-type">Exploring as a guest</span>
            </span>
            <ChevronDown size={15} />
          </Link>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>{t("workspace")}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{t("navAsk")}</span>
          </div>
          <button className="balance-pill" onClick={() => {
            setTopUpError("");
            setTopUpOpen(true);
          }}>
            <span className="balance-star"><Sparkles size={13} /></span>
            <span aria-live="polite">
              {balance === null
                ? t("balanceLoading")
                : `${balance} ${balance === 1 ? t("questionSingular") : t("questionPlural")}`}
            </span>
            <span className="balance-add"><Plus size={13} /></span>
          </button>
        </header>

        <div className="page-content">
          <section className="intro-section" id="ask">
            <div className="intro-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> {t("heroEyebrow")}</div>
              <h1>
                {t("heroTitle")}
                <br />
                <span>{t("heroTitleAccent")}</span>
              </h1>
              <p className="intro-description">{t("heroDescription")}</p>
              <div className="trust-line">
                <span className="trust-icon"><Check size={12} /></span>
                <span>{t("trustLine")}</span>
              </div>
            </div>
            <CelestialOrb />
          </section>

          <section className="ask-card" aria-labelledby="composer-title">
            <div className="ask-card-heading">
              <div>
                <p className="section-kicker">{t("questionPace")}</p>
                <h2 id="composer-title">{t("questionTitle")}</h2>
              </div>
              <div className="topic-selector">
                <span className="topic-indicator" />
                {t("astrologyTopic")}
              </div>
            </div>
            <form onSubmit={submitQuestion}>
              <label className="sr-only" htmlFor="question">
                {t("questionLabel")}
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={t("questionPlaceholder")}
                maxLength={500}
                rows={3}
                disabled={isLoading}
              />
              <div className="composer-footer">
                <div className="composer-hint">
                  <CircleHelp size={15} />
                  <span>{t("noBirthDetails")}</span>
                  <button
                    className={`voice-input-button ${isListening ? "voice-input-active" : ""}`}
                    type="button"
                    onClick={toggleVoiceInput}
                    aria-label={isListening ? t("stopVoice") : t("askByVoice")}
                    aria-pressed={isListening}
                    disabled={isLoading}
                  >
                    <Mic size={13} />                     {isListening ? t("listening") : t("voice")}
                  </button>
                </div>
                <div className="composer-actions">
                  <span className="character-count">{question.length}/500</span>
                  <button className="send-button" type="submit" disabled={!question.trim() || isLoading}>
                    {isLoading ? t("checking") : t("exploreAnswer")} <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </form>
            <div className="composer-bottom-note">
              <span className="composer-bottom-mark"><Sparkles size={13} /></span>
              {t("demoNote")}
            </div>
          </section>

          {isOffline && (
            <div className="status-message status-message-warning" role="status">
              {t("offlineMessage")}
            </div>
          )}
          {errorMessage && (
            <div className="status-message status-message-error" role="alert">
              <CircleHelp size={15} />
              <span>{errorMessage}</span>
            </div>
          )}
          {isLoading && (
            <section className="answer-loading" role="status" aria-live="polite">
              <span className="loading-orbit"><Sparkles size={15} /></span>
              <div>
                <strong>{t("checkingEvidence")}</strong>
                <p>{t("findingEvidence")}</p>
              </div>
              <span className="loading-dots" aria-hidden="true"><i /><i /><i /></span>
            </section>
          )}

          {topUpMessage && (
            <div className="toast-message" role="status">
              <Check size={16} /> {topUpMessage}
            </div>
          )}

          {answerVisible && (
            <section className="answer-card" aria-live="polite">
              <div className="answer-header">
                <div className="answer-label">
                  <span className="answer-label-icon"><Sparkles size={14} /></span>
                  <span>{answerProvider === "curated" ? t("curatedEvidence") : t("aiSelectedEvidence")}</span>
                  <span className="answer-dot">·</span>
                  <span>{hasEvidence ? t("groundedAnswer") : t("evidenceCheck")}</span>
                </div>
                {hasEvidence && (
                  <button
                    className={`save-button ${isSaved ? "save-button-active" : ""}`}
                    onClick={() => void toggleSavedInsight()}
                    disabled={isSaving}
                    aria-pressed={isSaved}
                  >
                    {isSaved ? <Check size={15} /> : <Bookmark size={15} />}
                    {isSaving ? t("saving") : isSaved ? t("saved") : t("saveInsight")}
                  </button>
                )}
              </div>
              <h2>{hasEvidence ? t("thoughtfulStart") : t("notEnoughEvidence")}</h2>
              <p className="answer-question">“{question}”</p>
              {hasEvidence ? (
                <>
                  <p className="answer-body">{answerText}</p>
                  <div className="answer-voice-actions">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) {
                          window.speechSynthesis.cancel();
                          setIsSpeaking(false);
                        } else {
                          speakAnswer();
                        }
                      }}
                    >
                      <Volume2 size={13} /> {isSpeaking ? t("stopSpeaking") : t("listenAnswer")}
                    </button>
                    <span>{t("browserAudio")}</span>
                  </div>
                  <button
                    className="evidence-toggle"
                    onClick={() => setShowEvidence((current) => !current)}
                    aria-expanded={showEvidence}
                  >
                    <BookOpen size={16} />
                    {showEvidence ? t("hideEvidence") : t("showEvidence")}
                    <ChevronDown className={showEvidence ? "chevron-open" : ""} size={15} />
                  </button>
                  {showEvidence && (
                    <div className="evidence-panel">
                      <div className="evidence-panel-heading">
                        <span className="evidence-check"><Check size={12} /></span>
                        <span>{t("supportingFacts")} · {evidence.length}</span>
                      </div>
                      {evidence.map((fact) => (
                        <div className="evidence-fact" key={fact.id}>
                          <span className="fact-marker" />
                          <div>
                            <p>{fact.content}</p>
                            <span className="evidence-source">
                              {fact.topic} · {fact.sourceLabel}
                              {fact.sourceUrl && (
                                <> · <a href={fact.sourceUrl} target="_blank" rel="noreferrer">{t("source")}</a></>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                      <p className="evidence-disclaimer">
                        {t("evidenceDisclaimer")}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="answer-body">
                  {t("insufficientEvidence")}
                </p>
              )}
              <div className="answer-footnote">
                <LockKeyhole size={13} />
                <span>{t("answerFootnote")}</span>
              </div>
            </section>
          )}

          {isSaved && answerVisible && (
            <section className="saved-insight-card">
              <div className="saved-insight-icon"><Bookmark size={15} /></div>
              <div>
                <p className="section-kicker">SAVED FOR LATER</p>
                <p className="saved-insight-question">{question}</p>
              </div>
              <button
                className="icon-button remove-saved"
                aria-label="Remove saved insight"
                onClick={() => void toggleSavedInsight()}
              >
                <X size={15} />
              </button>
            </section>
          )}

          {!answerVisible && (
            <section className="discover-section" id="discover">
              <article className="discovery-recommendation">
                <div>
                  <p className="section-kicker">A NEXT STEP FOR YOU</p>
                  <h2>Explore {discoveryRecommendation.label}</h2>
                  <p>{discoveryRecommendation.reason}</p>
                </div>
                <button
                  type="button"
                  className="discovery-recommendation-action"
                  onClick={() => {
                    setQuestion(discoveryRecommendation.question);
                    document.getElementById("question")?.focus();
                    document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {discoveryRecommendation.question} <ArrowUpRight size={14} />
                </button>
              </article>
              <div className="discover-heading">
                <div>
                  <p className="section-kicker">A PLACE TO BEGIN</p>
                  <h2>Not sure what to ask?</h2>
                </div>
                <button
                  className="shuffle-button"
                  onClick={() => setQuestion(suggestedQuestions[Math.floor(Math.random() * suggestedQuestions.length)].question)}
                >
                  Surprise me <ArrowDownLeft size={14} />
                </button>
              </div>
              <div className="suggestion-grid">
                {suggestedQuestions.map(({ category, question: suggested, icon: Icon }) => (
                  <button
                    className="suggestion-card"
                    key={suggested}
                    onClick={() => {
                      setQuestion(suggested);
                      document.getElementById("question")?.focus();
                    }}
                  >
                    <div className="suggestion-card-top">
                      <span className="suggestion-icon"><Icon size={16} /></span>
                      <span className="suggestion-category">{category}</span>
                      <ArrowUpRight className="suggestion-arrow" size={15} />
                    </div>
                    <span className="suggestion-question">{suggested}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="saved-library" id="saved">
            <div className="library-heading">
              <div>
                <p className="section-kicker">KEEP WHAT RESONATES</p>
                <h2>Saved insights</h2>
              </div>
              <Bookmark size={17} />
            </div>
            {history.filter((item) => item.saved).length > 0 ? (
              <div className="library-list">
                {history.filter((item) => item.saved).map((item) => (
                  <button
                    className="library-item"
                    key={item.id}
                    onClick={() => openHistoryItem(item)}
                  >
                    <span className="library-item-icon"><Bookmark size={14} /></span>
                    <span className="library-item-copy">
                      <strong>{item.question}</strong>
                      <span>
                        {item.summary
                          ?? (item.jobStatus === "failed"
                            ? "Summary could not be prepared"
                            : "Preparing a short saved note…")}
                      </span>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="library-empty">Insights you save will be easy to find here.</p>
            )}
          </section>

          <section className="history-library" id="history">
            <div className="library-heading">
              <div>
                <p className="section-kicker">PICK UP WHERE YOU LEFT OFF</p>
                <h2>Recent questions</h2>
              </div>
              <History size={17} />
            </div>
            {history.length > 0 ? (
              <div className="library-list">
                {history.slice(0, 5).map((item) => (
                  <button
                    className="library-item"
                    key={item.id}
                    onClick={() => openHistoryItem(item)}
                  >
                    <span className="library-item-icon"><MessageCircle size={14} /></span>
                    <span className="library-item-copy">
                      <strong>{item.question}</strong>
                      <span>{item.status === "completed" ? "Evidence-backed answer" : "Insufficient evidence"} · {new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="library-empty">Your questions will be saved here so you can return to them.</p>
            )}
          </section>

          <section className="source-note" id="sources" aria-labelledby="sources-heading">
            <p className="section-kicker">A NOTE ON TRUST</p>
            <h2 id="sources-heading">How we think about sources</h2>
            <p>
              Answers are assembled from the reviewed evidence shown with each
              response. If the stored notes do not support an answer, Aster
              says so. General astrology content is for learning and reflection,
              not a personal reading or a certainty.
            </p>
            <Link href="/about">About this demo and its limits <ArrowUpRight size={12} /></Link>
          </section>

          <footer className="page-footer">
            <span>Made for curiosity, grounded in care.</span>
            <span>Made by Grisha Lala</span>
            <a href="#sources">How we think about sources <ArrowUpRight size={12} /></a>
          </footer>
        </div>
      </section>

      {topUpOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setTopUpOpen(false);
        }}>
          <section
            className="topup-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="topup-title"
          >
            <button
              className="icon-button modal-close"
              onClick={() => setTopUpOpen(false)}
              aria-label="Close demo questions dialog"
            >
              <X size={18} />
            </button>
            <div className="modal-sparkle"><Sparkles size={19} /></div>
            <p className="section-kicker">KEEP EXPLORING</p>
            <h2 id="topup-title">A few more questions?</h2>
            <p className="modal-description">
              Add five demo questions to your balance. This is a prototype—no payment details or real purchase involved.
            </p>
            <div className="demo-pack">
              <span className="demo-pack-icon"><Stars size={18} /></span>
              <span className="demo-pack-copy">
                <strong>Curiosity pack</strong>
                <span>5 questions · demo credits</span>
              </span>
              <span className="demo-pack-price">Free</span>
            </div>
            <button className="modal-primary" onClick={() => void addDemoQuestions()} disabled={isTopUpLoading}>
              {isTopUpLoading ? "Adding demo questions…" : "Add 5 demo questions"}
              {!isTopUpLoading && <Plus size={16} />}
            </button>
            {topUpError && <p className="modal-error" role="alert">{topUpError}</p>}
            <button className="modal-secondary" onClick={() => setTopUpOpen(false)}>
              Maybe later
            </button>
            <p className="modal-safe-note"><LockKeyhole size={12} /> No card. No charge. Just a demo.</p>
          </section>
        </div>
      )}
    </main>
  );
}
