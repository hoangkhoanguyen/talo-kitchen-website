CREATE TYPE "public"."status" AS ENUM('scheduled', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TABLE "prod"."configs" (
	"key" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"config_type" varchar(20) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk_configs" PRIMARY KEY("key","config_type")
);
--> statement-breakpoint
CREATE TABLE "prod"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(20),
	"avatar" text,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "prod"."refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"refresh_token" text NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"category_id" integer NOT NULL,
	"allergen_info" text,
	"sub_description" text,
	"description" text,
	"price" real DEFAULT 0 NOT NULL,
	"related_product_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "prod"."product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"description" varchar(1024),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "prod"."product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(512) NOT NULL,
	"alt_text" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."product_addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"price" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"last_used_address" text,
	"last_used_order_type" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."order_item_addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer NOT NULL,
	"addon_id" integer NOT NULL,
	"addon_name" varchar(255) NOT NULL,
	"price" real NOT NULL,
	"quantity" integer NOT NULL,
	"total_price" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"price" real NOT NULL,
	"quantity" integer NOT NULL,
	"total_price" real NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"total_price" real NOT NULL,
	"note" text,
	"internal_note" text DEFAULT '' NOT NULL,
	"order_type" varchar(20) NOT NULL,
	"order_type_label" varchar(100),
	"delivery_address" text DEFAULT '' NOT NULL,
	"address_note" text DEFAULT '' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"shipping_fee" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "orders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "prod"."order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"previous_status" varchar(50) NOT NULL,
	"new_status" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prod"."reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"customer_full_name" varchar(255) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"internal_note" text DEFAULT '' NOT NULL,
	"number_of_people" varchar(20) NOT NULL,
	"arrival_time" time NOT NULL,
	"arrival_date" date NOT NULL,
	"status" "status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "reservations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "prod"."reservation_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_id" integer NOT NULL,
	"previous_status" varchar(50) NOT NULL,
	"new_status" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prod"."product_addons" ADD CONSTRAINT "product_addons_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "prod"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."order_item_addons" ADD CONSTRAINT "order_item_addons_addon_id_product_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "prod"."product_addons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."order_item_addons" ADD CONSTRAINT "order_item_addons_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "prod"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "prod"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "prod"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "prod"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prod"."reservation_status_history" ADD CONSTRAINT "reservation_status_history_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "prod"."reservations"("id") ON DELETE no action ON UPDATE no action;