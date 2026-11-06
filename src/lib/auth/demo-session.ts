import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { creditLedger, demoSessions } from "@/lib/db/schema";

const COOKIE_NAME = "aster_demo_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSigningSecret(): string {
  const secret = process.env.DEMO_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("DEMO_SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

function sign(sessionId: string): string {
  return createHmac("sha256", getSigningSecret()).update(sessionId).digest("hex");
}

function verifyCookieValue(value: string | undefined): string | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 0) return null;

  const sessionId = value.slice(0, separator);
  const providedSignature = value.slice(separator + 1);
  if (!/^[0-9a-f-]{36}$/i.test(sessionId) || !/^[0-9a-f]{64}$/i.test(providedSignature)) {
    return null;
  }

  const expectedSignature = sign(sessionId);
  const provided = Buffer.from(providedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return timingSafeEqual(provided, expected) ? sessionId : null;
}

export async function getDemoSession() {
  const cookieStore = await cookies();
  const existingId = verifyCookieValue(cookieStore.get(COOKIE_NAME)?.value);
  const sessionId = existingId ?? randomUUID();

  await getDb().transaction(async (tx) => {
    const [session] = await tx
      .insert(demoSessions)
      .values({ id: sessionId, balance: 1 })
      .onConflictDoNothing()
      .returning({ id: demoSessions.id });

    if (session) {
      await tx.insert(creditLedger).values({
        sessionId,
        amount: 1,
        reason: "welcome_credit",
        idempotencyKey: "welcome-credit-v1",
      });
    }

    const [existingSession] = await tx
      .select({ id: demoSessions.id })
      .from(demoSessions)
      .where(eq(demoSessions.id, sessionId))
      .limit(1);

    if (!existingSession) {
      throw new Error("Demo session could not be initialized.");
    }
  });

  if (!existingId) {
    cookieStore.set(COOKIE_NAME, `${sessionId}.${sign(sessionId)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });
  }

  return sessionId;
}
