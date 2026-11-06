const discoveryTopics = [
  {
    terms: ["career", "job", "work", "profession", "business"],
    label: "career and vocation",
    question: "How is vocation traditionally considered in Vedic astrology?",
  },
  {
    terms: ["relationship", "compatibility", "marriage", "partner", "love"],
    label: "relationships",
    question: "How do astrologers approach compatibility, and what are its limits?",
  },
  {
    terms: ["planet", "retrograde", "mars", "venus", "saturn", "jupiter", "mercury", "moon", "sun"],
    label: "planetary concepts",
    question: "How do astrologers interpret a planet in a Vedic birth chart?",
  },
  {
    terms: ["dasha", "timing", "period", "transit"],
    label: "astrological timing systems",
    question: "What is a dasha period in Vedic astrology?",
  },
];

export type DiscoveryRecommendation = {
  label: string;
  question: string;
  reason: string;
};

export function getDiscoveryRecommendation(questions: string[]): DiscoveryRecommendation {
  const recentQuestionsText = questions.slice(0, 5).join(" ").toLowerCase();
  const match = discoveryTopics.find((topic) =>
    topic.terms.some((term) => recentQuestionsText.includes(term)),
  );

  if (match) {
    return {
      label: match.label,
      question: match.question,
      reason: `Suggested because your recent questions mention ${match.label}.`,
    };
  }

  return {
    label: "astrology foundations",
    question: "What is a birth chart, and what can it tell me?",
    reason: questions.length
      ? "A general concept to continue exploring from your recent questions."
      : "A gentle starting point while there is no question history to personalize from.",
  };
}
