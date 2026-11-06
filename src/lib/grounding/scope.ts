const personalTopics = /\b(?:chart|kundli|birth|career|marri(?:age|ed|es)?|health|future|money|job|relationship|invest)\b/iu;
const personalDecision = /\b(?:will|would|should|when|can i|am i|do i)\b/iu;

const localizedScopePatterns = {
  hi: {
    possessive: /(?:मेरा|मेरी|मेरे|मुझे|अपनी|अपने)/u,
    topic: /(?:कुंडली|जन्म|करियर|शादी|विवाह|स्वास्थ्य|भविष्य|नौकरी|संबंध|रिश्ता|धन|पैसा)/u,
    decision: /(?:कब|क्या होगा|क्या मुझे|मिलेगी|मिलेगा|करूँ|होगा|होगी)/u,
  },
  es: {
    possessive: /\b(?:mi|mis|mío|mía|míos|mías)\b/iu,
    topic: /\b(?:carta|nacimiento|carrera|matrimonio|salud|futuro|empleo|trabajo|relación|dinero|casar)\b/iu,
    decision: /\b(?:cuándo|cuando|seré|tendré|debería|podré|me casaré|conseguiré)\b/iu,
  },
  fr: {
    possessive: /\b(?:mon|ma|mes|moi|mien|mienne)\b/iu,
    topic: /\b(?:thème|carte|naissance|carrière|mariage|marier|santé|avenir|emploi|travail|relation|argent)\b/iu,
    decision: /\b(?:quand|serai-je|aurai-je|devrais-je|pourrai-je|vais-je)\b/iu,
  },
  de: {
    possessive: /\b(?:mein|meine|meiner|meinen|meines|mir|mich)\b/iu,
    topic: /\b(?:horoskop|geburt|karriere|heirat(?:en)?|gesundheit|zukunft|beruf|arbeit|beziehung|geld)\b/iu,
    decision: /\b(?:wann|werde ich|soll ich|kann ich|bekomme ich|heirate ich)\b/iu,
  },
  pt: {
    possessive: /\b(?:meu|minha|meus|minhas|meu próprio|minha própria)\b/iu,
    topic: /\b(?:mapa|nascimento|carreira|casamento|casar|saúde|futuro|emprego|trabalho|relacionamento|dinheiro)\b/iu,
    decision: /\b(?:quando|serei|terei|devo|poderei|vou conseguir|vou me casar)\b/iu,
  },
} as const;

export function isOutsideEducationalScope(question: string, locale: keyof typeof localizedScopePatterns | "en" = "en") {
  if (locale !== "en") {
    const patterns = localizedScopePatterns[locale];
    const hasPersonalPossessive = patterns.possessive.test(question);
    const asksForPersonalPrediction = patterns.decision.test(question) && patterns.topic.test(question);
    return (hasPersonalPossessive && patterns.topic.test(question)) || asksForPersonalPrediction;
  }

  const hasPersonalPossessive = /\b(?:my|mine)\b/iu.test(question);
  const asksForPersonalPrediction =
    personalDecision.test(question) &&
    /\b(?:i|me)\b/iu.test(question) &&
    personalTopics.test(question);
  return (hasPersonalPossessive && personalTopics.test(question)) || asksForPersonalPrediction;
}
