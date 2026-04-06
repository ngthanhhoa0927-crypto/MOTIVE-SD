-- Drop old enum values and recreate
DROP TYPE IF EXISTS "public"."order_status" CASCADE;
CREATE TYPE "public"."order_status" AS ENUM('processing', 'shipped', 'delivered', 'cancelled');
--> statement-breakpoint

-- Drop old order tables to recreate with new schema
DROP TABLE IF EXISTS "public"."order_items" CASCADE;
DROP TABLE IF EXISTS "public"."orders" CASCADE;
--> statement-breakpoint

-- Create new orders table
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" varchar(50) NOT NULL,
	"user_id" integer NOT NULL,
	"receiver_name" varchar NOT NULL,
	"receiver_phone" varchar NOT NULL,
	"shipping_address" text NOT NULL,
	"shipping_city" varchar(255) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"shipping_method" "shipping_method" NOT NULL,
	"status" "order_status" DEFAULT 'processing' NOT NULL,
	"subtotal" numeric(18, 2) NOT NULL,
	"shipping_fee" numeric(18, 2) NOT NULL,
	"tax" numeric(18, 2) DEFAULT '0',
	"total_amount" numeric(18, 2) NOT NULL,
	"payment_url" varchar(500),
	"payment_status" varchar(50) DEFAULT 'pending',
	"estimated_delivery_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint

-- Create new order_items table with snapshot data
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar NOT NULL,
	"product_image" varchar(500),
	"quantity" integer NOT NULL,
	"price_at_purchase" numeric(18, 2) NOT NULL,
	"size" varchar(50),
	"color" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add foreign keys
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
