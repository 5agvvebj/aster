import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, assertSameOrigin, errorResponse } from "@/lib/api/errors";
import { getDemoSession } from "@/lib/auth/demo-session";
import { getDb } from "@/lib/db";
import { answers, backgroundJobs, savedInsights } from "@/lib/db/schema";

type RouteContext = { params: Promise<{ answerId: string }> };

async function getOwnedAnswer(sessionId: string, answerId: string) {
  const [answer] = await getDb()
    .select({ id: answers.id })
    .from(answers)
    .where(and(eq(answers.id, answerId), eq(answers.sessionId, sessionId)))
    .limit(1);
  if (!answer) throw new ApiError(404, "answer_not_found", "That answer could not be found.");
  return answer;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const { answerId } = await context.params;
    const parsedId = z.string().uuid().safeParse(answerId);
    if (!parsedId.success) {
      throw new ApiError(400, "invalid_answer_id", "That answer could not be found.");
    }

    const sessionId = await getDemoSession();
    await getOwnedAnswer(sessionId, answerId);
    await getDb().transaction(async (tx) => {
      const [savedInsight] = await tx
        .insert(savedInsights)
        .values({ sessionId, answerId })
        .onConflictDoNothing()
        .returning({ id: savedInsights.id });

      if (savedInsight) {
        await tx
          .insert(backgroundJobs)
          .values({
            sessionId,
            type: "saved_insight_summary",
            idempotencyKey: `saved-insight-summary:${answerId}`,
            payload: { answerId },
          })
          .onConflictDoNothing();
      }
    });
    return NextResponse.json({ saved: true }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const { answerId } = await context.params;
    const parsedId = z.string().uuid().safeParse(answerId);
    if (!parsedId.success) {
      throw new ApiError(400, "invalid_answer_id", "That answer could not be found.");
    }

    const sessionId = await getDemoSession();
    await getDb()
      .delete(savedInsights)
      .where(and(eq(savedInsights.sessionId, sessionId), eq(savedInsights.answerId, answerId)));
    return NextResponse.json({ saved: false }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
