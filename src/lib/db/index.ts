import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  postgresClient?: ReturnType<typeof postgres>;
};

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required. Copy .env.example and start the local database.");
  }

  const client =
    globalForDb.postgresClient ??
    postgres(connectionString, {
      max: process.env.NODE_ENV === "production" ? 5 : 1,
      prepare: false,
    });

  globalForDb.postgresClient = client;

  return drizzle(client, { schema });
}

export async function closeDb() {
  await globalForDb.postgresClient?.end();
  globalForDb.postgresClient = undefined;
}
