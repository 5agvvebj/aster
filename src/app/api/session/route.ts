import { getDemoSession } from "@/lib/auth/demo-session";
import { readBalance } from "@/lib/credits/ledger";
import { errorResponse } from "@/lib/api/errors";
import { connection, NextResponse } from "next/server";

export async function GET() {
  await connection();
  try {
    const sessionId = await getDemoSession();
    const balance = await readBalance(sessionId);
    return NextResponse.json({ balance }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
