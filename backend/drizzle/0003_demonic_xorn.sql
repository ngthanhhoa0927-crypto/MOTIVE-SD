ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" varchar(500);