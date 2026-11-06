import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const demoSessions = pgTable("demo_sessions", {
  id: uuid("id").primaryKey(),
  balance: integer("balance").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => demoSessions.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    reason: text("reason", { enum: ["welcome_credit", "demo_top_up", "question"] }).notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("credit_ledger_session_idempotency_unique").on(
      table.sessionId,
      table.idempotencyKey,
    ),
    index("credit_ledger_session_created_idx").on(table.sessionId, table.createdAt),
  ],
);

export const evidenceFacts = pgTable(
  "evidence_facts",
  {
    id: text("id").primaryKey(),
    domain: text("domain").notNull(),
    topic: text("topic").notNull(),
    content: text("content").notNull(),
    sourceLabel: text("source_label").notNull(),
    sourceUrl: text("source_url"),
    tags: text("tags").array().notNull().default([]),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("evidence_facts_domain_active_idx").on(table.domain, table.active)],
);

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => demoSessions.id, { onDelete: "cascade" }),
    requestId: uuid("request_id").notNull(),
    question: text("question").notNull(),
    domain: text("domain").notNull(),
    status: text("status", { enum: ["completed", "insufficient_evidence"] }).notNull(),
    answerText: text("answer_text").notNull(),
    locale: text("locale", { enum: ["en", "hi", "es", "fr", "de", "pt"] }).notNull().default("en"),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    provider: text("provider", { enum: ["gemini", "groq", "curated"] }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("answers_session_request_unique").on(table.sessionId, table.requestId),
    index("answers_session_created_idx").on(table.sessionId, table.createdAt),
  ],
);

export const savedInsights = pgTable(
  "saved_insights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => demoSessions.id, { onDelete: "cascade" }),
    answerId: uuid("answer_id")
      .notNull()
      .references(() => answers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("saved_insights_session_answer_unique").on(table.sessionId, table.answerId),
    index("saved_insights_session_created_idx").on(table.sessionId, table.createdAt),
  ],
);

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => demoSessions.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("journal_entries_session_created_idx").on(table.sessionId, table.createdAt)],
);

export const backgroundJobs = pgTable(
  "background_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => demoSessions.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["saved_insight_summary"] }).notNull(),
    status: text("status", {
      enum: ["pending", "running", "completed", "failed"],
    }).notNull().default("pending"),
    idempotencyKey: text("idempotency_key").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    attempts: integer("attempts").notNull().default(0),
    availableAt: timestamp("available_at", { withTimezone: true }).notNull().defaultNow(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("background_jobs_session_idempotency_unique").on(
      table.sessionId,
      table.idempotencyKey,
    ),
    index("background_jobs_status_available_idx").on(table.status, table.availableAt),
  ],
);

export const rateLimitBuckets = pgTable("rate_limit_buckets", {
  key: text("key").primaryKey(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
  requestCount: integer("request_count").notNull().default(0),
});
