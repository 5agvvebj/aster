import { desc, eq, inArray, sql } from "drizzle-orm";
import { connection, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/errors";
import { getDemoSession } from "@/lib/auth/demo-session";
import { getDb } from "@/lib/db";
import { answers, backgroundJobs, evidenceFacts, savedInsights } from "@/lib/db/schema";
import { getFactTranslation } from "@/lib/grounding/translations";

export async function GET() {
  await connection();
  try {
    const sessionId = await getDemoSession();
    const rows = await getDb()
      .select({
        id: answers.id,
        question: answers.question,
        status: answers.status,
        answerText: answers.answerText,
        locale: answers.locale,
        evidenceIds: answers.evidenceIds,
        provider: answers.provider,
        createdAt: answers.createdAt,
        saved: sql<boolean>`${savedInsights.id} IS NOT NULL`,
      })
      .from(answers)
      .leftJoin(
        savedInsights,
        sql`${savedInsights.answerId} = ${answers.id} AND ${savedInsights.sessionId} = ${sessionId}`,
      )
      .where(eq(answers.sessionId, sessionId))
      .orderBy(desc(answers.createdAt))
      .limit(30);
    const evidenceIds = [...new Set(rows.flatMap((answer) => answer.evidenceIds))];
    const evidence = evidenceIds.length === 0
      ? []
      : await getDb()
        .select({
          id: evidenceFacts.id,
          topic: evidenceFacts.topic,
          content: evidenceFacts.content,
          sourceLabel: evidenceFacts.sourceLabel,
          sourceUrl: evidenceFacts.sourceUrl,
        })
        .from(evidenceFacts)
        .where(inArray(evidenceFacts.id, evidenceIds));
    const factsById = new Map(evidence.map((fact) => [fact.id, fact]));
    const jobs = await getDb()
      .select({
        status: backgroundJobs.status,
        payload: backgroundJobs.payload,
      })
      .from(backgroundJobs)
      .where(eq(backgroundJobs.sessionId, sessionId));
    const jobsByAnswerId = new Map<string, {
      status: (typeof jobs)[number]["status"];
      summary: string | null;
    }>();
    for (const job of jobs) {
      const answerId = job.payload.answerId;
      if (typeof answerId === "string") {
        jobsByAnswerId.set(answerId, {
          status: job.status,
          summary: typeof job.payload.summary === "string" ? job.payload.summary : null,
        });
      }
    }

    return NextResponse.json(
      {
        answers: rows.map((answer) => ({
          ...answer,
          evidence: answer.evidenceIds
            .map((id) => factsById.get(id))
            .filter((fact) => fact !== undefined)
            .map((fact) => getFactTranslation(fact, answer.locale)),
          summary: jobsByAnswerId.get(answer.id)?.summary ?? null,
          jobStatus: jobsByAnswerId.get(answer.id)?.status ?? null,
        })),
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
