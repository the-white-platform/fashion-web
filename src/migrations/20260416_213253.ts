import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_size_chart_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_size_chart_columns_locales" (
  	"header" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_size_chart_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "products_size_chart_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "size_charts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "size_charts_locales" DISABLE ROW LEVEL SECURITY;
  -- DROP TABLE ... CASCADE removes the FK constraint
  -- (payload_locked_documents_rels_size_charts_fk) and its backing index
  -- (payload_locked_documents_rels_size_charts_id_idx) automatically, so
  -- the explicit DROP CONSTRAINT / DROP INDEX below must use IF EXISTS
  -- to stay idempotent across pg versions.
  DROP TABLE "size_charts" CASCADE;
  DROP TABLE "size_charts_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_size_charts_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_size_charts_id_idx";
  ALTER TABLE "products_locales" ADD COLUMN "size_chart_note" varchar;
  ALTER TABLE "products_size_chart_columns" ADD CONSTRAINT "products_size_chart_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_size_chart_columns_locales" ADD CONSTRAINT "products_size_chart_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_size_chart_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_size_chart_rows_cells" ADD CONSTRAINT "products_size_chart_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_size_chart_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_size_chart_rows" ADD CONSTRAINT "products_size_chart_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_size_chart_columns_order_idx" ON "products_size_chart_columns" USING btree ("_order");
  CREATE INDEX "products_size_chart_columns_parent_id_idx" ON "products_size_chart_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_size_chart_columns_locales_locale_parent_id_unique" ON "products_size_chart_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_size_chart_rows_cells_order_idx" ON "products_size_chart_rows_cells" USING btree ("_order");
  CREATE INDEX "products_size_chart_rows_cells_parent_id_idx" ON "products_size_chart_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "products_size_chart_rows_order_idx" ON "products_size_chart_rows" USING btree ("_order");
  CREATE INDEX "products_size_chart_rows_parent_id_idx" ON "products_size_chart_rows" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "size_charts_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "size_charts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "size_charts_locales" (
  	"title" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "products_size_chart_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_size_chart_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_size_chart_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_size_chart_rows" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_size_chart_columns" CASCADE;
  DROP TABLE "products_size_chart_columns_locales" CASCADE;
  DROP TABLE "products_size_chart_rows_cells" CASCADE;
  DROP TABLE "products_size_chart_rows" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "size_charts_id" integer;
  ALTER TABLE "size_charts" ADD CONSTRAINT "size_charts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "size_charts_locales" ADD CONSTRAINT "size_charts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."size_charts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "size_charts_category_idx" ON "size_charts" USING btree ("category_id");
  CREATE INDEX "size_charts_updated_at_idx" ON "size_charts" USING btree ("updated_at");
  CREATE INDEX "size_charts_created_at_idx" ON "size_charts" USING btree ("created_at");
  CREATE UNIQUE INDEX "size_charts_filename_idx" ON "size_charts" USING btree ("filename");
  CREATE INDEX "size_charts_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "size_charts" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "size_charts_sizes_medium_sizes_medium_filename_idx" ON "size_charts" USING btree ("sizes_medium_filename");
  CREATE INDEX "size_charts_sizes_large_sizes_large_filename_idx" ON "size_charts" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "size_charts_locales_locale_parent_id_unique" ON "size_charts_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_size_charts_fk" FOREIGN KEY ("size_charts_id") REFERENCES "public"."size_charts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_size_charts_id_idx" ON "payload_locked_documents_rels" USING btree ("size_charts_id");
  ALTER TABLE "products_locales" DROP COLUMN "size_chart_note";`)
}
