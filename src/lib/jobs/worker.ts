import { and, asc, eq, gte, lt, lte } from "drizzle-orm";
import { closeDb, getDb } from "@/lib/db";
import { answers, backgroundJobs } from "@/lib/db/schema";

const MAX_ATTEMPTS = 3;
const STALE_LOCK_MS = 5 * 60 * 1_000;

export function retryDelayMs(attempt: number) {
  return Math.min(5_000 * 2 ** Math.max(0, attempt - 1), 5 * 60_000);
}

export function generateSavedSummary(question: string, answerText: string) {
  const cleaned = answerText.replace(/\s+/gu, " ").trim();
  if (!question.trim() || !cleaned) {
    throw new Error("A saved answer needs both a question and answer text.");
  }
  const sentences = cleaned.match(/[^.!?]+[.!?]?/gu) ?? [];
  const summary = sentences.slice(0, 2).join("").trim();
  const characters = Array.from(summary);
  return characters.length <= 280
    ? summary
    : `${characters.slice(0, 277).join("").trimEnd()}…`;
}

async function recoverExpiredJobs() {
  const expiredBefore = new Date(Date.now() - STALE_LOCK_MS);
  const now = new Date();
  await getDb()
    .update(backgroundJobs)
    .set({
      status: "pending",
      lockedAt: null,
      availableAt: now,
      lastError: "Worker lease expired before completion.",
      updatedAt: now,
    })
    .where(and(
      eq(backgroundJobs.status, "running"),
      lt(backgroundJobs.lockedAt, expiredBefore),
      lt(backgroundJobs.attempts, MAX_ATTEMPTS),
    ));

  await getDb()
    .update(backgroundJobs)
    .set({
      status: "failed",
      lockedAt: null,
      lastError: "Worker lease expired after the retry limit.",
      updatedAt: now,
    })
    .where(and(
      eq(backgroundJobs.status, "running"),
      lt(backgroundJobs.lockedAt, expiredBefore),
      gte(backgroundJobs.attempts, MAX_ATTEMPTS),
    ));
}

async function claimNextJob() {
  return getDb().transaction(async (tx) => {
    const now = new Date();
    const [candidate] = await tx
      .select()
      .from(backgroundJobs)
      .where(and(
        eq(backgroundJobs.status, "pending"),
        lte(backgroundJobs.availableAt, now),
        lt(backgroundJobs.attempts, MAX_ATTEMPTS),
      ))
      .orderBy(asc(backgroundJobs.availableAt), asc(backgroundJobs.createdAt))
      .limit(1)
      .for("update", { skipLocked: true });

    if (!candidate) return null;
    const [claimed] = await tx
      .update(backgroundJobs)
      .set({
        status: "running",
        attempts: candidate.attempts + 1,
        lockedAt: now,
        updatedAt: now,
      })
      .where(eq(backgroundJobs.id, candidate.id))
      .returning();
    return claimed ?? null;
  });
}

async function runClaimedJob(job: NonNullable<Awaited<ReturnType<typeof claimNextJob>>>) {
  const answerId = job.payload.answerId;
  if (typeof answerId !== "string") {
    throw new Error("Saved-insight job has no answer identifier.");
  }

  const [answer] = await getDb()
    .select({ question: answers.question, answerText: answers.answerText })
    .from(answers)
    .where(and(eq(answers.id, answerId), eq(answers.sessionId, job.sessionId)))
    .limit(1);
  if (!answer) throw new Error("Saved answer is no longer available.");

  switch (job.type) {
    case "saved_insight_summary": {
      const summary = generateSavedSummary(answer.question, answer.answerText);
      await getDb()
        .update(backgroundJobs)
        .set({
          status: "completed",
          payload: { ...job.payload, summary },
          lockedAt: null,
          lastError: null,
          updatedAt: new Date(),
        })
        .where(and(eq(backgroundJobs.id, job.id), eq(backgroundJobs.status, "running")));
      return;
    }
  }
}

async function recordFailure(
  job: NonNullable<Awaited<ReturnType<typeof claimNextJob>>>,
  error: unknown,
) {
  const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown job error";
  const terminal = job.attempts >= MAX_ATTEMPTS;
  const now = new Date();
  await getDb()
    .update(backgroundJobs)
    .set({
      status: terminal ? "failed" : "pending",
      availableAt: terminal ? job.availableAt : new Date(now.getTime() + retryDelayMs(job.attempts)),
      lockedAt: null,
      lastError: message,
      updatedAt: now,
    })
    .where(and(eq(backgroundJobs.id, job.id), eq(backgroundJobs.status, "running")));

  console.error(JSON.stringify({
    event: "background_job_attempt_failed",
    jobId: job.id,
    jobType: job.type,
    attempt: job.attempts,
    terminal,
    timestamp: now.toISOString(),
  }));
}

export async function processNextJob() {
  await recoverExpiredJobs();
  const job = await claimNextJob();
  if (!job) return false;

  try {
    await runClaimedJob(job);
    console.info(JSON.stringify({
      event: "background_job_completed",
      jobId: job.id,
      jobType: job.type,
      attempt: job.attempts,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    await recordFailure(job, error);
  }
  return true;
}

export async function runWorker(signal: AbortSignal) {
  console.info(JSON.stringify({
    event: "background_worker_started",
    timestamp: new Date().toISOString(),
  }));

  while (!signal.aborted) {
    try {
      const hadJob = await processNextJob();
      if (!hadJob) await new Promise((resolve) => setTimeout(resolve, 1_000));
    } catch (error) {
      console.error(JSON.stringify({
        event: "background_worker_iteration_failed",
        message: error instanceof Error ? error.message : "Unknown worker error",
        timestamp: new Date().toISOString(),
      }));
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
  }
}

export function createWorkerAbortController() {
  const controller = new AbortController();
  process.once("SIGINT", () => controller.abort());
  process.once("SIGTERM", () => controller.abort());
  return controller;
}

export async function finishWorkerProcess() {
  await closeDb();
}
