ALTER TABLE "responses" ADD COLUMN IF NOT EXISTS "opinion" text;--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN IF NOT EXISTS "te_encanto" boolean;--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN IF NOT EXISTS "salida" text;
