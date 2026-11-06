import { z } from "zod";
import { ApiError, assertSameOrigin, errorResponse, readJsonBody } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { ModelUnavailableError, selectEvidence } from "@/lib/ai/provider";
import { getDemoSession } from "@/lib/auth/demo-session";
import {
  findAnswerByRequest,
  readBalance,
  spendQuestionAndSaveAnswer,
  type AnswerRecord,
} from "@/lib/credits/ledger";
import { getDb } from "@/lib/db";
import { evidenceFacts } from "@/lib/db/schema";
import { retrieveFacts } from "@/lib/grounding/retrieve";
import { isOutsideEducationalScope } from "@/lib/grounding/scope";
import { and, eq, inArray } from "drizzle-orm";
import type { Locale } from "@/lib/locale";
import { getAnswerPrefix, getFactTranslation, getInsufficientEvidenceMessage } from "@/lib/grounding/translations";

const requestSchema = z.object({
  requestId: z.string().uuid(),
  domain: z.enum(["vedic_astrology"]),
  question: z.string().trim().min(4).max(500),
  locale: z.enum(["en", "hi", "es", "fr", "de", "pt"]).default("en"),
});

type EvidenceFact = {
  id: string;
  topic: string;
  content: string;
  sourceLabel: string;
  sourceUrl: string | null;
};

function composeAnswer(facts: EvidenceFact[], locale: Locale) {
  return `${getAnswerPrefix(locale)}\n\n${facts.map((fact) => fact.content).join("\n\n")}`;
}

async function loadEvidence(ids: string[], locale: Locale) {
  if (ids.length === 0) return [];
  const facts = await getDb()
    .select({
      id: evidenceFacts.id,
      topic: evidenceFacts.topic,
      content: evidenceFacts.content,
      sourceLabel: evidenceFacts.sourceLabel,
      sourceUrl: evidenceFacts.sourceUrl,
    })
    .from(evidenceFacts)
    .where(and(inArray(evidenceFacts.id, ids), eq(evidenceFacts.active, true)));
  return facts.map((fact) => getFactTranslation(fact, locale));
}

function streamAnswer(
  answer: {
    id: string;
    status: "completed" | "insufficient_evidence";
    answerText: string;
    provider: "gemini" | "groq" | "curated";
  },
  evidence: EvidenceFact[],
  balance: number,
) {
  const encoder = new TextEncoder();
  const encodeEvent = (event: string, data: unknown) =>
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encodeEvent("metadata", {
        answerId: answer.id,
        status: answer.status,
        provider: answer.provider,
        balance,
      }));

      for (const word of answer.answerText.match(/\S+\s*/gu) ?? []) {
        controller.enqueue(encodeEvent("delta", { text: word }));
        await new Promise((resolve) => setTimeout(resolve, 12));
      }

      controller.enqueue(encodeEvent("evidence", {
        facts: evidence.map((fact) => ({
          id: fact.id,
          topic: fact.topic,
          content: fact.content,
          sourceLabel: fact.sourceLabel,
          sourceUrl: fact.sourceUrl,
        })),
      }));
      controller.enqueue(encodeEvent("done", {}));
      controller.close();
    },
  });

  return new Response(body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJsonBody(request, requestSchema);
    const sessionId = await getDemoSession();
    await enforceRateLimit(`answer:${sessionId}`, 8, 60);

    const existing = await findAnswerByRequest(sessionId, body.requestId);
    if (existing) {
      if (existing.question !== body.question || existing.domain !== body.domain || existing.locale !== body.locale) {
        throw new ApiError(409, "request_id_reused", "Please start a new question and try again.");
      }
      const evidence = await loadEvidence(existing.evidenceIds, existing.locale);
      return streamAnswer(existing, evidence, await readBalance(sessionId));
    }

    const outsideScope = isOutsideEducationalScope(body.question, body.locale);
    const retrieved = outsideScope ? [] : await retrieveFacts(body.question, body.domain, body.locale);
    const selection = await selectEvidence(body.question, retrieved);
    const selectedFacts = retrieved.filter((fact) => selection.factIds.includes(fact.id));
    const hasSupportedEvidence = selectedFacts.length > 0;
    const answerRecord: AnswerRecord = {
      requestId: body.requestId,
      question: body.question,
      domain: body.domain,
      status: hasSupportedEvidence ? "completed" : "insufficient_evidence",
      answerText: hasSupportedEvidence
        ? composeAnswer(selectedFacts, body.locale)
        : getInsufficientEvidenceMessage(body.locale),
      locale: body.locale,
      evidenceIds: selectedFacts.map((fact) => fact.id),
      provider: selection.provider,
    };

    const stored = await spendQuestionAndSaveAnswer(sessionId, answerRecord, selectedFacts);
    const evidence = await loadEvidence(stored.answer.evidenceIds, stored.answer.locale);
    return streamAnswer(stored.answer, evidence, stored.balance);
  } catch (error) {
    if (error instanceof ModelUnavailableError) {
      return errorResponse(new ApiError(503, "answer_service_unavailable", error.message));
    }
    return errorResponse(error);
  }
}
