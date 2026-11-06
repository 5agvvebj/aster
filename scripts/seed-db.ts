import "dotenv/config";
import { closeDb, getDb } from "../src/lib/db";
import { evidenceFacts } from "../src/lib/db/schema";
import { seedFacts } from "../src/lib/grounding/seed-facts";

async function main() {
  try {
    await getDb()
      .insert(evidenceFacts)
      .values(seedFacts)
      .onConflictDoNothing();
    console.info(JSON.stringify({
      event: "evidence_facts_seeded",
      count: seedFacts.length,
      timestamp: new Date().toISOString(),
    }));
  } finally {
    await closeDb();
  }
}

main().catch((error: unknown) => {
  console.error("Could not seed the reviewed demo facts.", error);
  process.exitCode = 1;
});
