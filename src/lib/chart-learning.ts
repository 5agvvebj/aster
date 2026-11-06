export type ChartConcept = {
  id: string;
  name: string;
  symbol: string;
  domain: "house" | "graha";
  summary: string;
  question: string;
};

export const chartConcepts: ChartConcept[] = [
  { id: "house-1", name: "First house", symbol: "01", domain: "house", summary: "Traditionally associated with the self, embodiment, and how a chart is approached. Personal interpretation depends on an actual calculated chart.", question: "What does the first house represent in Vedic astrology?" },
  { id: "house-2", name: "Second house", symbol: "02", domain: "house", summary: "Traditionally connected with resources, speech, and family context. A house alone is not a prediction about wealth.", question: "What does the second house represent in Vedic astrology?" },
  { id: "house-3", name: "Third house", symbol: "03", domain: "house", summary: "Often discussed in relation to communication, effort, skills, and siblings within traditional chart interpretation.", question: "What does the third house represent in Vedic astrology?" },
  { id: "house-4", name: "Fourth house", symbol: "04", domain: "house", summary: "Traditionally linked with home, foundations, education, and inner steadiness. Personal placements are not available in this demo.", question: "What does the fourth house represent in Vedic astrology?" },
  { id: "house-5", name: "Fifth house", symbol: "05", domain: "house", summary: "Often associated with learning, creative expression, and discernment in classical interpretive frameworks.", question: "What does the fifth house represent in Vedic astrology?" },
  { id: "house-6", name: "Sixth house", symbol: "06", domain: "house", summary: "Traditionally considered through themes of service, routines, obstacles, and responsibilities—not as a health diagnosis.", question: "What does the sixth house represent in Vedic astrology?" },
  { id: "house-7", name: "Seventh house", symbol: "07", domain: "house", summary: "Traditionally associated with partnership, agreements, and one-to-one relationships; it cannot determine relationship outcomes by itself.", question: "What does the seventh house represent in Vedic astrology?" },
  { id: "house-8", name: "Eighth house", symbol: "08", domain: "house", summary: "Often discussed through change, shared matters, and hidden or researched subjects in traditional astrology.", question: "What does the eighth house represent in Vedic astrology?" },
  { id: "house-9", name: "Ninth house", symbol: "09", domain: "house", summary: "Traditionally connected with learning, teachers, philosophy, and long-distance journeys.", question: "What does the ninth house represent in Vedic astrology?" },
  { id: "house-10", name: "Tenth house", symbol: "10", domain: "house", summary: "Often considered in relation to vocation, public contribution, and responsibilities. It does not guarantee a career outcome.", question: "What does the tenth house represent in Vedic astrology?" },
  { id: "house-11", name: "Eleventh house", symbol: "11", domain: "house", summary: "Traditionally associated with communities, aspirations, and gains as themes for interpretation.", question: "What does the eleventh house represent in Vedic astrology?" },
  { id: "house-12", name: "Twelfth house", symbol: "12", domain: "house", summary: "Often connected with retreat, expenditure, distant places, and release in traditional interpretive frameworks.", question: "What does the twelfth house represent in Vedic astrology?" },
  { id: "graha-sun", name: "Surya · Sun", symbol: "☉", domain: "graha", summary: "A Navagraha associated in traditional interpretation with vitality, authority, and illumination. No personal placement is calculated here.", question: "What does Surya represent among the Navagrahas?" },
  { id: "graha-moon", name: "Chandra · Moon", symbol: "☾", domain: "graha", summary: "Traditionally discussed through themes of mind, feeling, and changing rhythms. This is an educational overview, not a personal reading.", question: "What does Chandra represent among the Navagrahas?" },
  { id: "graha-mars", name: "Mangala · Mars", symbol: "♂", domain: "graha", summary: "Often associated with energy, initiative, and action in traditional Vedic astrology.", question: "What does Mangala represent among the Navagrahas?" },
  { id: "graha-mercury", name: "Budha · Mercury", symbol: "☿", domain: "graha", summary: "Traditionally connected with communication, analysis, learning, and exchange.", question: "What does Budha represent among the Navagrahas?" },
  { id: "graha-jupiter", name: "Guru · Jupiter", symbol: "♃", domain: "graha", summary: "Often associated with teaching, counsel, wisdom, and expansive learning in traditional interpretation.", question: "What does Guru represent among the Navagrahas?" },
  { id: "graha-venus", name: "Shukra · Venus", symbol: "♀", domain: "graha", summary: "Traditionally discussed through themes of refinement, relationship, enjoyment, and the arts.", question: "What does Shukra represent among the Navagrahas?" },
  { id: "graha-saturn", name: "Shani · Saturn", symbol: "♄", domain: "graha", summary: "Often associated with discipline, time, persistence, and responsibilities in traditional Vedic astrology.", question: "What does Shani represent among the Navagrahas?" },
  { id: "graha-rahu", name: "Rahu", symbol: "☊", domain: "graha", summary: "A lunar node, not a physical planet. Traditional interpretations often associate Rahu with amplification, novelty, and unconventional paths.", question: "What is Rahu in Vedic astrology, and how is it different from a planet?" },
  { id: "graha-ketu", name: "Ketu", symbol: "☋", domain: "graha", summary: "A lunar node, not a physical planet. Traditional interpretations often discuss Ketu through separation, inward focus, and release.", question: "What is Ketu in Vedic astrology, and how is it different from a planet?" },
];

export const houses = chartConcepts.filter((concept) => concept.domain === "house");
export const grahas = chartConcepts.filter((concept) => concept.domain === "graha");

export function getConcept(id: string): ChartConcept | undefined {
  return chartConcepts.find((concept) => concept.id === id);
}
