import { z } from "zod";
import { assertSameOrigin, errorResponse, readJsonBody } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { getDemoSession } from "@/lib/auth/demo-session";
import { addDemoCredits } from "@/lib/credits/ledger";
import { NextResponse } from "next/server";

const topUpSchema = z.object({
  requestId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJsonBody(request, topUpSchema);
    const sessionId = await getDemoSession();
    await enforceRateLimit(`top-up:${sessionId}`, 5, 60);
    const result = await addDemoCredits(sessionId, body.requestId);
    return NextResponse.json(result, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
