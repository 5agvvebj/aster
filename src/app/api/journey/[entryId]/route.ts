import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, assertSameOrigin, errorResponse } from "@/lib/api/errors";
import { getDemoSession } from "@/lib/auth/demo-session";
import { getDb } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";

type RouteContext = { params: Promise<{ entryId: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const { entryId } = await context.params;
    if (!z.string().uuid().safeParse(entryId).success) {
      throw new ApiError(400, "invalid_entry_id", "That journal entry could not be found.");
    }

    const sessionId = await getDemoSession();
    const [deleted] = await getDb()
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.sessionId, sessionId)))
      .returning({ id: journalEntries.id });
    if (!deleted) {
      throw new ApiError(404, "entry_not_found", "That journal entry could not be found.");
    }
    return NextResponse.json({ deleted: true }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
