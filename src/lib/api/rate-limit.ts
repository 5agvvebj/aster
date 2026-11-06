import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { rateLimitBuckets } from "@/lib/db/schema";
import { ApiError } from "./errors";

export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - windowSeconds * 1_000);
  const [bucket] = await getDb()
    .insert(rateLimitBuckets)
    .values({
      key,
      windowStartedAt: sql`${now.toISOString()}::timestamptz`,
      requestCount: 1,
    })
    .onConflictDoUpdate({
      target: rateLimitBuckets.key,
      set: {
        windowStartedAt: sql`CASE
          WHEN ${rateLimitBuckets.windowStartedAt} <= ${expiredBefore.toISOString()}::timestamptz
          THEN ${now.toISOString()}::timestamptz
          ELSE ${rateLimitBuckets.windowStartedAt}
        END`,
        requestCount: sql`CASE
          WHEN ${rateLimitBuckets.windowStartedAt} <= ${expiredBefore.toISOString()}::timestamptz
          THEN 1
          ELSE ${rateLimitBuckets.requestCount} + 1
        END`,
      },
    })
    .returning({ requestCount: rateLimitBuckets.requestCount });

  if (!bucket) throw new Error("Rate limit bucket update did not return a row.");
  if (bucket.requestCount > limit) {
    throw new ApiError(429, "rate_limited", "Too many requests. Please wait a moment and try again.");
  }
}
