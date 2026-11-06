CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"request_id" uuid NOT NULL,
	"question" text NOT NULL,
	"domain" text NOT NULL,
	"status" text NOT NULL,
	"answer_text" text NOT NULL,
	"evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"provider" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"idempotency_key" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_facts" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"topic" text NOT NULL,
	"content" text NOT NULL,
	"source_label" text NOT NULL,
	"source_url" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"key" text PRIMARY KEY NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_session_id_demo_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."demo_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_jobs" ADD CONSTRAINT "background_jobs_session_id_demo_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."demo_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_session_id_demo_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."demo_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_insights" ADD CONSTRAINT "saved_insights_session_id_demo_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."demo_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_insights" ADD CONSTRAINT "saved_insights_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "answers_session_request_unique" ON "answers" USING btree ("session_id","request_id");--> statement-breakpoint
CREATE INDEX "answers_session_created_idx" ON "answers" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "background_jobs_session_idempotency_unique" ON "background_jobs" USING btree ("session_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "background_jobs_status_available_idx" ON "background_jobs" USING btree ("status","available_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_session_idempotency_unique" ON "credit_ledger" USING btree ("session_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "credit_ledger_session_created_idx" ON "credit_ledger" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "evidence_facts_domain_active_idx" ON "evidence_facts" USING btree ("domain","active");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_insights_session_answer_unique" ON "saved_insights" USING btree ("session_id","answer_id");--> statement-breakpoint
CREATE INDEX "saved_insights_session_created_idx" ON "saved_insights" USING btree ("session_id","created_at");