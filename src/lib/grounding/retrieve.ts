import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { evidenceFacts } from "@/lib/db/schema";
import type { Locale } from "@/lib/locale";
import { getFactTranslation } from "@/lib/grounding/translations";

const stopWords = new Set([
  "a",
  "about",
  "and",
  "astrologers",
  "approach",
  "are",
  "can",
  "does",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "or",
  "the",
  "tell",
  "that",
  "this",
  "to",
  "what",
  "when",
  "where",
  "which",
  "why",
  "with",
  "you",
  "your",
  "qué",
  "como",
  "para",
  "por",
  "una",
  "uno",
  "los",
  "las",
  "del",
  "con",
  "que",
  "est",
  "des",
  "une",
  "les",
  "dans",
  "pour",
  "avec",
  "est",
  "der",
  "die",
  "das",
  "und",
  "ist",
  "ein",
  "eine",
  "mit",
  "was",
  "wie",
  "und",
  "uma",
  "com",
  "dos",
  "das",
  "para",
  "que",
  "क्या",
  "कैसे",
  "कब",
  "और",
  "एक",
  "है",
  "होता",
  "होती",
  "मुझे",
  "मेरी",
  "मेरे",
  "मेरा",
  "में",
  "के",
  "की",
  "का",
]);

function tokenize(value: string): string[] {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .match(/[\p{Letter}\p{Number}]+/gu)
    ?.filter((token) => token.length > 2 && !stopWords.has(token)) ?? [];
}

type FactRow = {
  id: string;
  domain: string;
  topic: string;
  content: string;
  sourceLabel: string;
  sourceUrl: string | null;
  tags: string[];
};

export function rankEvidenceFacts(question: string, rows: FactRow[], locale: Locale = "en") {
  const queryTokens = [...new Set(tokenize(question))];
  if (queryTokens.length === 0) return [];

  return rows
    .map((fact) => {
      const localizedFact = getFactTranslation(fact, locale);
      const tags = new Set(tokenize(localizedFact.tags.join(" ")));
      const content = new Set(tokenize(`${localizedFact.topic} ${localizedFact.content}`));
      const score = queryTokens.reduce((sum, token) => {
        if (tags.has(token)) return sum + 2;
        if (content.has(token)) return sum + 1;
        return sum;
      }, 0);

      return {
        ...localizedFact,
        score,
        matched: queryTokens.filter((token) => tags.has(token) || content.has(token)).length,
      };
    })
    .filter((fact) => fact.score > 0 && fact.matched / queryTokens.length >= 0.6)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, 5);
}

export async function retrieveFacts(question: string, domain: string, locale: Locale = "en") {
  const rows = await getDb()
    .select({
      id: evidenceFacts.id,
      domain: evidenceFacts.domain,
      topic: evidenceFacts.topic,
      content: evidenceFacts.content,
      sourceLabel: evidenceFacts.sourceLabel,
      sourceUrl: evidenceFacts.sourceUrl,
      tags: evidenceFacts.tags,
    })
    .from(evidenceFacts)
    .where(and(eq(evidenceFacts.domain, domain), eq(evidenceFacts.active, true)));

  return rankEvidenceFacts(question, rows, locale);
}

export type RetrievedFact = Awaited<ReturnType<typeof retrieveFacts>>[number];
