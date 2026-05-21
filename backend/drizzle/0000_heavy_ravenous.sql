CREATE TABLE IF NOT EXISTS "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"responded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"visitor_uuid" text NOT NULL,
	"ip_hash" text NOT NULL,
	"device" text,
	"browser" text,
	"os" text,
	CONSTRAINT "responses_visitor_uuid_unique" UNIQUE("visitor_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent" text,
	"device" text,
	"browser" text,
	"os" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_responses_responded_at" ON "responses" USING btree ("responded_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visits_visited_at" ON "visits" USING btree ("visited_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visits_ip_hash" ON "visits" USING btree ("ip_hash");