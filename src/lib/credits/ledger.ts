import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { answers, creditLedger, demoSessions } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/errors";
import type { RetrievedFact } from "@/lib/grounding/retrieve";
import type { Locale } from "@/lib/locale";

export async function readBalance(sessionId: string) {
  const [session] = await getDb()
    .select({ balance: demoSessions.balance })
    .from(demoSessions)
    .where(eq(demoSessions.id, sessionId))
    .limit(1);
  if (!session) throw new Error("Demo session is missing from storage.");
  return session.balance;
}

export async function addDemoCredits(sessionId: string, requestId: string) {
  return getDb().transaction(async (tx) => {
    const [ledgerEntry] = await tx
      .insert(creditLedger)
      .values({
        sessionId,
        amount: 5,
        reason: "demo_top_up",
        idempotencyKey: `demo-top-up:${requestId}`,
      })
      .onConflictDoNothing()
      .returning({ id: creditLedger.id });

    if (ledgerEntry) {
      const [updatedSession] = await tx
        .update(demoSessions)
        .set({
          balance: sql`${demoSessions.balance} + 5`,
          updatedAt: new Date(),
        })
        .where(eq(demoSessions.id, sessionId))
        .returning({ balance: demoSessions.balance });
      if (!updatedSession) throw new Error("Demo session could not be topped up.");
      return { balance: updatedSession.balance, added: 5 };
    }

    const [session] = await tx
      .select({ balance: demoSessions.balance })
      .from(demoSessions)
      .where(eq(demoSessions.id, sessionId))
      .limit(1);
    if (!session) throw new Error("Demo session is missing from storage.");
    return { balance: session.balance, added: 0 };
  });
}

export interface AnswerRecord {
  requestId: string;
  question: string;
  domain: string;
  status: "completed" | "insufficient_evidence";
  answerText: string;
  locale: Locale;
  evidenceIds: string[];
  provider: "gemini" | "groq" | "curated";
}

export async function findAnswerByRequest(sessionId: string, requestId: string) {
  const [answer] = await getDb()
    .select()
    .from(answers)
    .where(and(eq(answers.sessionId, sessionId), eq(answers.requestId, requestId)))
    .limit(1);
  return answer;
}

export async function spendQuestionAndSaveAnswer(
  sessionId: string,
  answer: AnswerRecord,
  facts: RetrievedFact[],
) {
  return getDb().transaction(async (tx) => {
    const [ledgerEntry] = await tx
      .insert(creditLedger)
      .values({
        sessionId,
        amount: -1,
        reason: "question",
        idempotencyKey: `question:${answer.requestId}`,
      })
      .onConflictDoNothing()
      .returning({ id: creditLedger.id });

    if (!ledgerEntry) {
      const [existingAnswer] = await tx
        .select()
        .from(answers)
        .where(and(eq(answers.sessionId, sessionId), eq(answers.requestId, answer.requestId)))
        .limit(1);
      if (!existingAnswer) throw new Error("Idempotent answer record is missing.");

      const [session] = await tx
        .select({ balance: demoSessions.balance })
        .from(demoSessions)
        .where(eq(demoSessions.id, sessionId))
        .limit(1);
      if (!session) throw new Error("Demo session is missing from storage.");
      return { answer: existingAnswer, balance: session.balance, charged: false };
    }

    const [session] = await tx
      .update(demoSessions)
      .set({
        balance: sql`${demoSessions.balance} - 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(demoSessions.id, sessionId), gt(demoSessions.balance, 0)))
      .returning({ balance: demoSessions.balance });

    if (!session) {
      throw new ApiError(402, "insufficient_credits", "You’re out of demo questions. Add a few more to continue.");
    }

    const [savedAnswer] = await tx
      .insert(answers)
      .values({
        sessionId,
        requestId: answer.requestId,
        question: answer.question,
        domain: answer.domain,
        status: answer.status,
        answerText: answer.answerText,
        locale: answer.locale,
        evidenceIds: facts.map((fact) => fact.id),
        provider: answer.provider,
      })
      .returning();

    if (!savedAnswer) throw new Error("Answer was not saved.");
    return { answer: savedAnswer, balance: session.balance, charged: true };
  });
}
