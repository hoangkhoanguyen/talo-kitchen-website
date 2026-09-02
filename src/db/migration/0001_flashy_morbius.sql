CREATE TABLE "dev_multi_lang"."product_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(255),
	"description" text,
	"sub_description" text,
	"allergen_info" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_translations_product_id_locale_unique" UNIQUE("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "dev_multi_lang"."product_category_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255),
	"description" varchar(1024),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_category_translations_category_id_locale_unique" UNIQUE("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "dev_multi_lang"."product_addon_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"addon_id" integer NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_addon_translations_addon_id_locale_unique" UNIQUE("addon_id","locale")
);
--> statement-breakpoint
ALTER TABLE "dev_multi_lang"."product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "dev_multi_lang"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_multi_lang"."product_category_translations" ADD CONSTRAINT "product_category_translations_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "dev_multi_lang"."product_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dev_multi_lang"."product_addon_translations" ADD CONSTRAINT "product_addon_translations_addon_id_product_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "dev_multi_lang"."product_addons"("id") ON DELETE cascade ON UPDATE no action;