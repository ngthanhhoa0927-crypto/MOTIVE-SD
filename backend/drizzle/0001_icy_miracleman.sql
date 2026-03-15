CREATE TABLE "otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"otp" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" varchar;