import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// ─────────────────────────────────────────────────────────────────────────────
// Production-safe migration bundle for three schema shifts that landed on the
// i18n branch but never produced migrations (local DB was hand-patched):
//
//   1. ProductTags collection  → new `product_tags` + `product_tags_locales`
//   2. Faqs collection         → new `faqs` + `faqs_locales` + category enum
//   3. Products scalar tag     → dropped, replaced by FK `tag_id`
//   4. Products display order  → new `display_order` column + index
//
// Order matters. We must seed the six starter tag rows and backfill
// products.tag_id BEFORE dropping the old enum column — otherwise prod data
// on the `tag` column is lost. Down migration reverses the chain and restores
// the enum values from the FK'd tag codes.
// ─────────────────────────────────────────────────────────────────────────────

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ── 1/6 — ProductTags tables ──────────────────────────────────────────
  await db.execute(sql`
   CREATE TABLE "product_tags" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "order" numeric DEFAULT 0,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "product_tags_locales" (
    "label" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
   );

   ALTER TABLE "product_tags_locales" ADD CONSTRAINT "product_tags_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "public"."product_tags"("id") ON DELETE cascade ON UPDATE no action;

   CREATE UNIQUE INDEX "product_tags_code_idx" ON "product_tags" USING btree ("code");
   CREATE INDEX "product_tags_created_at_idx" ON "product_tags" USING btree ("created_at");
   CREATE INDEX "product_tags_updated_at_idx" ON "product_tags" USING btree ("updated_at");
   CREATE UNIQUE INDEX "product_tags_locales_locale_parent_id_unique" ON "product_tags_locales" USING btree ("_locale","_parent_id");`)

  // ── 2/6 — Seed the six starter tags (VI + EN labels) ──────────────────
  // Inserted in a fixed order so the rows get ids 1..6 in a fresh table.
  // The backfill in step 4 keys off `code`, not id, so if sequence is not
  // 1..6 on some replica the mapping still holds.
  await db.execute(sql`
   INSERT INTO "product_tags" ("code", "order") VALUES
     ('new', 0),
     ('bestseller', 1),
     ('sale-20', 2),
     ('sale-30', 3),
     ('sale-50', 4),
     ('hot', 5);

   INSERT INTO "product_tags_locales" ("_locale", "_parent_id", "label")
   SELECT 'vi'::_locales, pt.id, m.label
   FROM "product_tags" pt
   JOIN (VALUES
     ('new', 'Mới'),
     ('bestseller', 'Bán Chạy'),
     ('sale-20', 'Giảm 20%'),
     ('sale-30', 'Giảm 30%'),
     ('sale-50', 'Giảm 50%'),
     ('hot', 'Hot')
   ) AS m(code, label) ON m.code = pt.code;

   INSERT INTO "product_tags_locales" ("_locale", "_parent_id", "label")
   SELECT 'en'::_locales, pt.id, m.label
   FROM "product_tags" pt
   JOIN (VALUES
     ('new', 'New'),
     ('bestseller', 'Bestseller'),
     ('sale-20', '20% Off'),
     ('sale-30', '30% Off'),
     ('sale-50', '50% Off'),
     ('hot', 'Hot')
   ) AS m(code, label) ON m.code = pt.code;`)

  // ── 3/6 — Products: add tag_id column, backfill from old enum, drop old ─
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "tag_id" integer;`)

  // Backfill tag_id from the old enum column. The old enum values are the
  // Vietnamese display labels; map them to the new canonical codes.
  await db.execute(sql`
   UPDATE "products" SET "tag_id" = pt.id
   FROM "product_tags" pt
   WHERE pt.code = CASE "products"."tag"::text
     WHEN 'MỚI'      THEN 'new'
     WHEN 'BÁN CHẠY' THEN 'bestseller'
     WHEN 'GIẢM 20%' THEN 'sale-20'
     WHEN 'GIẢM 30%' THEN 'sale-30'
     WHEN 'GIẢM 50%' THEN 'sale-50'
     WHEN 'HOT'      THEN 'hot'
   END
   AND "products"."tag" IS NOT NULL;`)

  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "tag";
   DROP TYPE "public"."enum_products_tag";

   ALTER TABLE "products" ADD CONSTRAINT "products_tag_id_product_tags_id_fk"
    FOREIGN KEY ("tag_id") REFERENCES "public"."product_tags"("id") ON DELETE set null ON UPDATE no action;
   CREATE INDEX "products_tag_idx" ON "products" USING btree ("tag_id");`)

  // ── 4/6 — Products.display_order ──────────────────────────────────────
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "display_order" numeric DEFAULT 0;
   CREATE INDEX "products_display_order_idx" ON "products" USING btree ("display_order");`)

  // ── 5/6 — Faqs tables + enum ──────────────────────────────────────────
  await db.execute(sql`
   CREATE TYPE "public"."enum_faqs_category" AS ENUM('order', 'payment', 'shipping', 'return', 'product', 'account');

   CREATE TABLE "faqs" (
    "id" serial PRIMARY KEY NOT NULL,
    "category" "enum_faqs_category" DEFAULT 'order' NOT NULL,
    "order" numeric DEFAULT 0,
    "published" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "faqs_locales" (
    "question" varchar NOT NULL,
    "answer" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
   );

   ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;

   CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
   CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
   CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");`)

  // ── 6/6 — payload_locked_documents_rels columns for the two new tables ─
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faqs_id" integer;
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "product_tags_id" integer;

   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk"
    FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_tags_fk"
    FOREIGN KEY ("product_tags_id") REFERENCES "public"."product_tags"("id") ON DELETE cascade ON UPDATE no action;

   CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
   CREATE INDEX "payload_locked_documents_rels_product_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("product_tags_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Unwind in reverse dependency order.

  // ── 6/6 reverse — drop locked-docs rels additions ─────────────────────
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faqs_fk";
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_tags_fk";
   DROP INDEX "payload_locked_documents_rels_faqs_id_idx";
   DROP INDEX "payload_locked_documents_rels_product_tags_id_idx";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faqs_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "product_tags_id";`)

  // ── 5/6 reverse — drop Faqs tables + enum ─────────────────────────────
  await db.execute(sql`
   DROP TABLE "faqs_locales" CASCADE;
   DROP TABLE "faqs" CASCADE;
   DROP TYPE "public"."enum_faqs_category";`)

  // ── 4/6 reverse — drop display_order ──────────────────────────────────
  await db.execute(sql`
   DROP INDEX "products_display_order_idx";
   ALTER TABLE "products" DROP COLUMN "display_order";`)

  // ── 3/6 reverse — recreate enum_products_tag, backfill from tag_id, drop FK
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_tag" AS ENUM('MỚI', 'BÁN CHẠY', 'GIẢM 20%', 'GIẢM 30%', 'GIẢM 50%', 'HOT');
   ALTER TABLE "products" ADD COLUMN "tag" "enum_products_tag";

   UPDATE "products" SET "tag" = (
     CASE pt.code
       WHEN 'new'        THEN 'MỚI'
       WHEN 'bestseller' THEN 'BÁN CHẠY'
       WHEN 'sale-20'    THEN 'GIẢM 20%'
       WHEN 'sale-30'    THEN 'GIẢM 30%'
       WHEN 'sale-50'    THEN 'GIẢM 50%'
       WHEN 'hot'        THEN 'HOT'
     END
   )::enum_products_tag
   FROM "product_tags" pt
   WHERE pt.id = "products"."tag_id";

   ALTER TABLE "products" DROP CONSTRAINT "products_tag_id_product_tags_id_fk";
   DROP INDEX "products_tag_idx";
   ALTER TABLE "products" DROP COLUMN "tag_id";`)

  // ── 1-2/6 reverse — drop ProductTags tables ───────────────────────────
  await db.execute(sql`
   DROP TABLE "product_tags_locales" CASCADE;
   DROP TABLE "product_tags" CASCADE;`)
}
