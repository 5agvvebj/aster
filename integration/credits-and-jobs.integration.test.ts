import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/errors";
import { closeDb, getDb } from "@/lib/db";
import {
  answers,
  backgroundJobs,
  creditLedger,
  demoSessions,
} from "@/lib/db/schema";
import {
  addDemoCredits,
  readBalance,
  spendQuestionAndSaveAnswer,
} from "@/lib/credits/ledger";
import { processNextJob } from "@/lib/jobs/worker";

const createdSessionIds: string[] = [];

async function createSession(balance = 1) {
  const id = randomUUID();
  await getDb().insert(demoSessions).values({ id, balance });
  createdSessionIds.push(id);
  return id;
}

function answerRecord(sessionRequestId = randomUUID()) {
  return {
    requestId: sessionRequestId,
    question: "What is a birth chart?",
    domain: "vedic_astrology",
    status: "completed" as const,
    answerText: "A natal chart is a map calculated for a specific time and place.",
    locale: "en" as const,
    evidenceIds: [],
    provider: "curated" as const,
  };
}

afterEach(async () => {
  vi.restoreAllMocks();
  for (const id of createdSessionIds.splice(0)) {
    await getDb().delete(demoSessions).where(eq(demoSessions.id, id));
  }
});

afterAll(async () => {
  await closeDb();
});

describe("PostgreSQL credit ledger and background jobs", () => {
  it("allows only one concurrent question to spend the final credit", async () => {
    const sessionId = await createSession(1);
    const attempts = await Promise.allSettled([
      spendQuestionAndSaveAnswer(sessionId, answerRecord(), []),
      spendQuestionAndSaveAnswer(sessionId, answerRecord(), []),
    ]);

    expect(attempts.filter((attempt) => attempt.status === "fulfilled")).toHaveLength(1);
    const rejected = attempts.find((attempt) => attempt.status === "rejected");
    expect(rejected?.status).toBe("rejected");
    if (rejected?.status === "rejected") {
      expect(rejected.reason).toBeInstanceOf(ApiError);
      expect(rejected.reason).toMatchObject({ status: 402, code: "insufficient_credits" });
    }

    expect(await readBalance(sessionId)).toBe(0);
    const ledgerEntries = await getDb()
      .select()
      .from(creditLedger)
      .where(and(eq(creditLedger.sessionId, sessionId), eq(creditLedger.reason, "question")));
    expect(ledgerEntries).toHaveLength(1);
  });

  it("makes a retried question request idempotent", async () => {
    const sessionId = await createSession(1);
    const request = answerRecord();
    const results = await Promise.all([
      spendQuestionAndSaveAnswer(sessionId, request, []),
      spendQuestionAndSaveAnswer(sessionId, request, []),
    ]);

    expect(results.map((result) => result.charged).sort()).toEqual([false, true]);
    expect(await readBalance(sessionId)).toBe(0);
    const savedAnswers = await getDb()
      .select()
      .from(answers)
      .where(and(eq(answers.sessionId, sessionId), eq(answers.requestId, request.requestId)));
    expect(savedAnswers).toHaveLength(1);
  });

  it("does not duplicate a demo top-up when its request is retried", async () => {
    const sessionId = await createSession(1);
    const requestId = randomUUID();
    const results = await Promise.all([
      addDemoCredits(sessionId, requestId),
      addDemoCredits(sessionId, requestId),
    ]);

    expect(results.map((result) => result.added).sort()).toEqual([0, 5]);
    expect(await readBalance(sessionId)).toBe(6);
  });

  it("retries a failing job and marks it failed at the retry limit", async () => {
    const sessionId = await createSession();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const [job] = await getDb()
      .insert(backgroundJobs)
      .values({
        sessionId,
        type: "saved_insight_summary",
        idempotencyKey: `integration-retry:${randomUUID()}`,
        payload: {},
      })
      .returning();

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      if (attempt > 1) {
        await getDb()
          .update(backgroundJobs)
          .set({ availableAt: new Date(0) })
          .where(eq(backgroundJobs.id, job.id));
      }
      expect(await processNextJob()).toBe(true);
      const [updatedJob] = await getDb()
        .select()
        .from(backgroundJobs)
        .where(eq(backgroundJobs.id, job.id));
      expect(updatedJob.attempts).toBe(attempt);
      expect(updatedJob.status).toBe(attempt < 3 ? "pending" : "failed");
    }

    expect(await processNextJob()).toBe(false);
  });

  it("completes a saved-insight summary job once and safely ignores a repeat run", async () => {
    const sessionId = await createSession();
    const [answer] = await getDb()
      .insert(answers)
      .values({
        sessionId,
        requestId: randomUUID(),
        question: "What is a birth chart?",
        domain: "vedic_astrology",
        status: "completed",
        answerText: "A natal chart is a map. It uses a specific date and place.",
        evidenceIds: [],
        provider: "curated",
      })
      .returning();
    const [job] = await getDb()
      .insert(backgroundJobs)
      .values({
        sessionId,
        type: "saved_insight_summary",
        idempotencyKey: `integration-summary:${answer.id}`,
        payload: { answerId: answer.id },
      })
      .returning();

    expect(await processNextJob()).toBe(true);
    expect(await processNextJob()).toBe(false);

    const [completedJob] = await getDb()
      .select()
      .from(backgroundJobs)
      .where(eq(backgroundJobs.id, job.id));
    expect(completedJob.status).toBe("completed");
    expect(completedJob.attempts).toBe(1);
    expect(completedJob.payload.summary).toBe("A natal chart is a map. It uses a specific date and place.");
  });
});
