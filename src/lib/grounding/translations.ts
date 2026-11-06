import type { Locale } from "@/lib/locale";

type FactTranslation = {
  topic: string;
  content: string;
  tags: string[];
};

const translations: Record<Locale, Record<string, FactTranslation>> = {
  en: {},
  hi: {
    "birth-chart-definition": {
      topic: "जन्म कुंडली",
      content: "जन्म कुंडली किसी खास तारीख, समय और भौगोलिक स्थान के लिए निकाली गई खगोलीय स्थितियों का मानचित्र होती है।",
      tags: ["जन्म कुंडली", "कुंडली", "जन्म पत्रिका", "जन्म", "ग्रह", "स्थिति", "समय", "स्थान", "ज्योतिष"],
    },
    "vedic-chart-components": {
      topic: "कुंडली के घटक",
      content: "वैदिक ज्योतिष में कुंडली को आम तौर पर ग्रहों, राशियों और भावों सहित कई पारंपरिक कारकों के आधार पर समझा जाता है।",
      tags: ["वैदिक", "ज्योतिष", "ग्रह", "राशि", "भाव", "कुंडली", "ग्रहों", "राशियाँ"],
    },
    "astrology-limits": {
      topic: "व्याख्या की सीमाएँ",
      content: "ज्योतिष एक पारंपरिक मान्यता प्रणाली है; इसकी व्याख्याएँ वैज्ञानिक रूप से स्थापित भविष्यवाणियाँ या गारंटी नहीं हैं।",
      tags: ["ज्योतिष", "भविष्य", "भविष्यवाणी", "गारंटी", "विज्ञान", "निश्चितता", "साक्ष्य", "मान्यता"],
    },
    "retrograde-apparent-motion": {
      topic: "वक्री गति",
      content: "जब पृथ्वी से देखने पर कोई ग्रह पीछे की ओर चलता हुआ दिखाई देता है, तो इसे वक्री गति कहते हैं। यह पृथ्वी और उस ग्रह की सापेक्ष गति के कारण होता है।",
      tags: ["वक्री", "वक्री गति", "ग्रह", "पीछे", "गति", "पृथ्वी", "तारे"],
    },
    "dasha-period-system": {
      topic: "दशा अवधि",
      content: "ज्योतिष में दशा समय की अवधियों के अनुसार व्याख्या व्यवस्थित करने वाली ग्रह-अवधि प्रणाली है; विंशोत्तरी इसका एक उदाहरण है।",
      tags: ["दशा", "विंशोत्तरी", "ग्रह", "अवधि", "समय", "ज्योतिष", "ज्योतिषीय"],
    },
    "compatibility-method": {
      topic: "ज्योतिषीय अनुकूलता",
      content: "ज्योतिषीय अनुकूलता चुनी हुई परंपरा के अनुसार कुंडली के कारकों की तुलना से की गई व्याख्या है; इससे यह तय नहीं होता कि कोई रिश्ता सफल होगा या नहीं।",
      tags: ["अनुकूलता", "संबंध", "रिश्ता", "विवाह", "कुंडली", "तुलना", "सफल"],
    },
  },
  es: {
    "birth-chart-definition": {
      topic: "Carta natal",
      content: "Una carta natal es un mapa de las posiciones celestes calculadas para una fecha, hora y ubicación geográfica concretas.",
      tags: ["carta natal", "carta astral", "nacimiento", "fecha", "hora", "lugar", "posiciones", "kundli"],
    },
    "vedic-chart-components": {
      topic: "Elementos de la carta",
      content: "La astrología védica suele interpretar una carta mediante planetas (grahas), signos (rashis) y casas (bhavas), entre otros factores tradicionales.",
      tags: ["védica", "astrología", "planetas", "grahas", "signos", "rashis", "casas", "bhavas", "carta"],
    },
    "astrology-limits": {
      topic: "Límites de la interpretación",
      content: "La astrología es un sistema de creencias tradicional; sus interpretaciones no son predicciones ni garantías científicamente demostradas.",
      tags: ["astrología", "predicción", "futuro", "garantía", "ciencia", "certeza", "evidencia"],
    },
    "retrograde-apparent-motion": {
      topic: "Movimiento retrógrado",
      content: "Un planeta parece retrógrado cuando, visto desde la Tierra, parece moverse hacia atrás frente a las estrellas debido al movimiento relativo de la Tierra y ese planeta.",
      tags: ["retrógrado", "planeta", "hacia atrás", "movimiento", "tierra", "estrellas"],
    },
    "dasha-period-system": {
      topic: "Periodos Dasha",
      content: "Un dasha es un sistema de periodos planetarios usado en Jyotisha para organizar interpretaciones a lo largo del tiempo; Vimshottari es uno de estos sistemas.",
      tags: ["dasha", "vimshottari", "planetario", "periodo", "tiempo", "jyotisha"],
    },
    "compatibility-method": {
      topic: "Compatibilidad",
      content: "La compatibilidad astrológica compara factores de las cartas según una tradición elegida; no puede determinar si una relación tendrá éxito.",
      tags: ["compatibilidad", "relación", "matrimonio", "carta", "comparar", "éxito"],
    },
  },
  fr: {
    "birth-chart-definition": {
      topic: "Thème natal",
      content: "Un thème natal est une carte des positions célestes calculées pour une date, une heure et un lieu géographique précis.",
      tags: ["thème natal", "carte du ciel", "naissance", "date", "heure", "lieu", "positions", "kundli"],
    },
    "vedic-chart-components": {
      topic: "Éléments du thème",
      content: "L’astrologie védique interprète couramment un thème à travers les planètes (grahas), les signes (rashis) et les maisons (bhavas), parmi d’autres facteurs traditionnels.",
      tags: ["védique", "astrologie", "planètes", "grahas", "signes", "rashis", "maisons", "bhavas", "thème"],
    },
    "astrology-limits": {
      topic: "Limites de l’interprétation",
      content: "L’astrologie est un système de croyances traditionnel ; ses interprétations ne sont pas des prédictions ou garanties scientifiquement établies.",
      tags: ["astrologie", "prédiction", "avenir", "garantie", "science", "certitude", "preuves"],
    },
    "retrograde-apparent-motion": {
      topic: "Mouvement rétrograde",
      content: "Une planète semble rétrograde lorsqu’elle paraît reculer par rapport aux étoiles depuis la Terre, en raison du mouvement relatif de la Terre et de cette planète.",
      tags: ["rétrograde", "planète", "reculer", "mouvement", "terre", "étoiles"],
    },
    "dasha-period-system": {
      topic: "Périodes Dasha",
      content: "Un dasha est un système de périodes planétaires utilisé en Jyotisha pour organiser les interprétations dans le temps ; Vimshottari en est un exemple.",
      tags: ["dasha", "vimshottari", "planétaire", "période", "temps", "jyotisha"],
    },
    "compatibility-method": {
      topic: "Compatibilité",
      content: "La compatibilité astrologique compare des facteurs des thèmes selon une tradition choisie ; elle ne permet pas de déterminer la réussite d’une relation.",
      tags: ["compatibilité", "relation", "mariage", "thème", "comparer", "réussite"],
    },
  },
  de: {
    "birth-chart-definition": {
      topic: "Geburtshoroskop",
      content: "Ein Geburtshoroskop ist eine Karte der Himmelspositionen zu einem bestimmten Datum, einer Uhrzeit und einem geografischen Ort.",
      tags: ["geburtshoroskop", "geburtshoroskop", "geburt", "datum", "uhrzeit", "ort", "positionen", "kundli"],
    },
    "vedic-chart-components": {
      topic: "Bestandteile des Horoskops",
      content: "Die vedische Astrologie deutet ein Horoskop häufig anhand von Planeten (Grahas), Zeichen (Rashis) und Häusern (Bhavas) sowie weiteren traditionellen Faktoren.",
      tags: ["vedisch", "astrologie", "planeten", "grahas", "zeichen", "rashis", "häuser", "bhavas", "horoskop"],
    },
    "astrology-limits": {
      topic: "Grenzen der Deutung",
      content: "Astrologie ist ein traditionelles Glaubenssystem; ihre Deutungen sind keine wissenschaftlich belegten Vorhersagen oder Garantien.",
      tags: ["astrologie", "vorhersage", "zukunft", "garantie", "wissenschaft", "gewissheit", "belege"],
    },
    "retrograde-apparent-motion": {
      topic: "Rückläufige Bewegung",
      content: "Ein Planet erscheint rückläufig, wenn er von der Erde aus vor dem Sternenhintergrund rückwärts zu laufen scheint. Ursache ist die relative Bewegung der Erde und des Planeten.",
      tags: ["rückläufig", "planet", "rückwärts", "bewegung", "erde", "sterne"],
    },
    "dasha-period-system": {
      topic: "Dasha-Perioden",
      content: "Ein Dasha ist ein System planetarer Zeitabschnitte in Jyotisha, das Deutungen über verschiedene Zeiträume ordnet; Vimshottari ist ein solches System.",
      tags: ["dasha", "vimshottari", "planetar", "periode", "zeit", "jyotisha"],
    },
    "compatibility-method": {
      topic: "Astrologische Kompatibilität",
      content: "Astrologische Kompatibilität vergleicht Horoskopfaktoren nach einer gewählten Tradition; sie kann nicht feststellen, ob eine Beziehung erfolgreich sein wird.",
      tags: ["kompatibilität", "beziehung", "heirat", "horoskop", "vergleichen", "erfolg"],
    },
  },
  pt: {
    "birth-chart-definition": {
      topic: "Mapa natal",
      content: "Um mapa natal é um mapa das posições celestes calculadas para uma data, hora e localização geográfica específicas.",
      tags: ["mapa natal", "mapa astral", "nascimento", "data", "hora", "local", "posições", "kundli"],
    },
    "vedic-chart-components": {
      topic: "Elementos do mapa",
      content: "A astrologia védica costuma interpretar um mapa por meio dos planetas (grahas), signos (rashis) e casas (bhavas), entre outros fatores tradicionais.",
      tags: ["védica", "astrologia", "planetas", "grahas", "signos", "rashis", "casas", "bhavas", "mapa"],
    },
    "astrology-limits": {
      topic: "Limites da interpretação",
      content: "A astrologia é um sistema tradicional de crenças; suas interpretações não são previsões ou garantias comprovadas cientificamente.",
      tags: ["astrologia", "previsão", "futuro", "garantia", "ciência", "certeza", "evidências"],
    },
    "retrograde-apparent-motion": {
      topic: "Movimento retrógrado",
      content: "Um planeta parece retrógrado quando, visto da Terra, aparenta mover-se para trás em relação às estrelas devido ao movimento relativo da Terra e desse planeta.",
      tags: ["retrógrado", "planeta", "para trás", "movimento", "terra", "estrelas"],
    },
    "dasha-period-system": {
      topic: "Períodos Dasha",
      content: "Um dasha é um sistema de períodos planetários usado em Jyotisha para organizar interpretações ao longo do tempo; Vimshottari é um desses sistemas.",
      tags: ["dasha", "vimshottari", "planetário", "período", "tempo", "jyotisha"],
    },
    "compatibility-method": {
      topic: "Compatibilidade",
      content: "A compatibilidade astrológica compara fatores dos mapas de acordo com uma tradição escolhida; ela não determina se um relacionamento terá sucesso.",
      tags: ["compatibilidade", "relacionamento", "casamento", "mapa", "comparar", "sucesso"],
    },
  },
};

const answerPrefixes: Record<Locale, string> = {
  en: "Here is what the reviewed evidence supports:",
  hi: "समीक्षित साक्ष्य से यह जानकारी मिलती है:",
  es: "Esto es lo que respalda la evidencia revisada:",
  fr: "Voici ce qu’indiquent les sources vérifiées :",
  de: "Das wird durch die geprüften Quellen gestützt:",
  pt: "Isto é o que as evidências revisadas sustentam:",
};

const sourceLabels: Record<Locale, string> = {
  en: "Aster curated educational notes v1",
  hi: "Aster के संपादित शैक्षिक नोट्स v1",
  es: "Notas educativas revisadas por Aster v1",
  fr: "Notes pédagogiques vérifiées par Aster v1",
  de: "Von Aster geprüfte Lernnotizen v1",
  pt: "Notas educativas revisadas pela Aster v1",
};

const insufficientEvidenceMessages: Record<Locale, string> = {
  en: "I don’t have enough reviewed evidence to answer that reliably yet. Try a general question about a Vedic astrology concept, or come back when this topic has been reviewed.",
  hi: "इसका विश्वसनीय उत्तर देने के लिए हमारे पास अभी पर्याप्त समीक्षित साक्ष्य नहीं हैं। वैदिक ज्योतिष की किसी सामान्य अवधारणा के बारे में पूछें।",
  es: "Aún no tenemos suficiente evidencia revisada para responder con fiabilidad. Prueba con una pregunta general sobre un concepto de astrología védica.",
  fr: "Nous n’avons pas encore assez d’éléments vérifiés pour répondre de façon fiable. Essayez une question générale sur un concept d’astrologie védique.",
  de: "Es gibt noch nicht genug geprüfte Belege für eine verlässliche Antwort. Frage stattdessen nach einem allgemeinen Konzept der vedischen Astrologie.",
  pt: "Ainda não temos evidências revisadas suficientes para responder com segurança. Experimente uma pergunta geral sobre um conceito da astrologia védica.",
};

export function getFactTranslation<T extends { id: string; topic: string; content: string; tags?: string[]; sourceLabel?: string }>(
  fact: T,
  locale: Locale,
): T {
  const translation = translations[locale][fact.id];
  if (!translation) return fact;
  return {
    ...fact,
    topic: translation.topic,
    content: translation.content,
    ...(fact.sourceLabel ? { sourceLabel: sourceLabels[locale] } : {}),
    ...(fact.tags ? { tags: [...fact.tags, ...translation.tags] } : {}),
  };
}

export function getAnswerPrefix(locale: Locale) {
  return answerPrefixes[locale];
}

export function getInsufficientEvidenceMessage(locale: Locale) {
  return insufficientEvidenceMessages[locale];
}
