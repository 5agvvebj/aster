import { and, desc, eq } from "drizzle-orm";
import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin, errorResponse, readJsonBody } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { getDemoSession } from "@/lib/auth/demo-session";
import { getDb } from "@/lib/db";
import { answers, journalEntries, savedInsights } from "@/lib/db/schema";

const createEntrySchema = z.object({
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(2000),
});

export async function GET() {
  await connection();
  try {
    const sessionId = await getDemoSession();
    const [saved, notes] = await Promise.all([
      getDb()
        .select({
          id: answers.id,
          question: answers.question,
          answerText: answers.answerText,
          status: answers.status,
          createdAt: answers.createdAt,
        })
        .from(savedInsights)
        .innerJoin(
          answers,
          and(eq(answers.id, savedInsights.answerId), eq(answers.sessionId, sessionId)),
        )
        .where(eq(savedInsights.sessionId, sessionId))
        .orderBy(desc(savedInsights.createdAt))
        .limit(50),
      getDb()
        .select({
          id: journalEntries.id,
          title: journalEntries.title,
          body: journalEntries.body,
          createdAt: journalEntries.createdAt,
        })
        .from(journalEntries)
        .where(eq(journalEntries.sessionId, sessionId))
        .orderBy(desc(journalEntries.createdAt))
        .limit(100),
    ]);

    const timeline = [
      ...saved.map((entry) => ({
        id: entry.id,
        type: "saved_answer" as const,
        title: entry.question,
        body: entry.answerText,
        createdAt: entry.createdAt,
        status: entry.status,
      })),
      ...notes.map((entry) => ({
        id: entry.id,
        type: "journal" as const,
        title: entry.title,
        body: entry.body,
        createdAt: entry.createdAt,
        status: null,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ timeline }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = await readJsonBody(request, createEntrySchema);
    const sessionId = await getDemoSession();
    await enforceRateLimit(`journey-write:${sessionId}`, 10, 60);
    const [entry] = await getDb()
      .insert(journalEntries)
      .values({ sessionId, title: input.title, body: input.body })
      .returning({
        id: journalEntries.id,
        title: journalEntries.title,
        body: journalEntries.body,
        createdAt: journalEntries.createdAt,
      });

    return NextResponse.json(
      { entry: { ...entry, type: "journal" as const, status: null } },
      { status: 201, headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
