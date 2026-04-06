CREATE TYPE "public"."audit_action" AS ENUM('user_created', 'user_updated', 'user_deleted', 'user_disabled', 'user_enabled', 'password_reset', 'login_failed', 'login_success', 'admin_action');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('account_created', 'order_placed', 'account_deleted', 'order_confirmed', 'password_changed');--> statement-breakpoint
CREATE TYPE "public"."otp_type" AS ENUM('registration', 'reset_password');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" "audit_action" NOT NULL,
	"performed_by" integer NOT NULL,
	"target_user" integer,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"description" varchar(500),
	"data_before" text,
	"data_after" text,
	"status" varchar(20) DEFAULT 'success',
	"error_message" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_variant_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "carts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "notification_type" NOT NULL,
	"user_id" integer,
	"user_name" varchar(255) NOT NULL,
	"user_avatar" varchar(500),
	"message" varchar(500) NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "otps" ADD COLUMN "type" "otp_type" DEFAULT 'registration' NOT NULL;--> statement-breakpoint
ALTER TABLE "otps" ADD COLUMN "is_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "otps" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "color" varchar(50);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "material" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "size_info" varchar(500);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "care" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "package_weight" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "shipping_class" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "package_dimensions" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "lead_time" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "disabled_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "disabled_reason" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "disabled_by" integer;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;