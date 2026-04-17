import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ── 1/3 — Add new locale tables, columns, and user preferred_locale ────
  // Pure additions. No destructive changes yet so existing data is intact
  // while we copy it across.
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_preferred_locale" AS ENUM('vi', 'en');
  CREATE TYPE "public"."enum_newsletter_subscribers_preferred_locale" AS ENUM('vi', 'en');
  CREATE TABLE "pages_blocks_cta_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "pages_blocks_content_columns_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "_pages_v_blocks_cta_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "_pages_v_blocks_content_columns_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "products_colors_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "header_nav_items_locales" (
  	"link_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  ALTER TABLE "pages_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_title" varchar;
  ALTER TABLE "media_locales" ADD COLUMN "caption" jsonb;
  ALTER TABLE "users" ADD COLUMN "preferred_locale" "enum_users_preferred_locale" DEFAULT 'vi' NOT NULL;
  ALTER TABLE "newsletter_subscribers" ADD COLUMN "preferred_locale" "enum_newsletter_subscribers_preferred_locale" DEFAULT 'vi' NOT NULL;
  ALTER TABLE "pages_blocks_cta_links_locales" ADD CONSTRAINT "pages_blocks_cta_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns_locales" ADD CONSTRAINT "pages_blocks_content_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links_locales" ADD CONSTRAINT "_pages_v_blocks_cta_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns_locales" ADD CONSTRAINT "_pages_v_blocks_content_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_colors_locales" ADD CONSTRAINT "products_colors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_colors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_locales" ADD CONSTRAINT "header_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_cta_links_locales_locale_parent_id_unique" ON "pages_blocks_cta_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_content_columns_locales_locale_parent_id_unique" ON "pages_blocks_content_columns_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_links_locales_locale_parent_id_unique" ON "_pages_v_blocks_cta_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_content_columns_locales_locale_parent_id_uni" ON "_pages_v_blocks_content_columns_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "products_colors_locales_locale_parent_id_unique" ON "products_colors_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "header_nav_items_locales_locale_parent_id_unique" ON "header_nav_items_locales" USING btree ("_locale","_parent_id");`)

  // ── 2/3 — Copy existing scalar values into the VI locale rows ─────────
  // Do this BEFORE dropping the source columns. `pages_locales` and
  // `media_locales` may already have a VI row because other fields on
  // those tables were already localized (SEO meta, alt text) — use
  // ON CONFLICT so we update those rows instead of erroring. The purely
  // new locale tables (products_colors_locales, header_nav_items_locales,
  // *_blocks_*_links_locales) can plain INSERT.
  await db.execute(sql`
   INSERT INTO "pages_locales" ("_locale", "_parent_id", "title")
   SELECT 'vi'::_locales, "id", "title" FROM "pages" WHERE "title" IS NOT NULL
   ON CONFLICT ("_locale", "_parent_id") DO UPDATE SET "title" = EXCLUDED."title";

   INSERT INTO "_pages_v_locales" ("_locale", "_parent_id", "version_title")
   SELECT 'vi'::_locales, "id", "version_title" FROM "_pages_v" WHERE "version_title" IS NOT NULL
   ON CONFLICT ("_locale", "_parent_id") DO UPDATE SET "version_title" = EXCLUDED."version_title";

   INSERT INTO "media_locales" ("_locale", "_parent_id", "caption")
   SELECT 'vi'::_locales, "id", "caption" FROM "media" WHERE "caption" IS NOT NULL
   ON CONFLICT ("_locale", "_parent_id") DO UPDATE SET "caption" = EXCLUDED."caption";

   INSERT INTO "products_colors_locales" ("_locale", "_parent_id", "name")
   SELECT 'vi'::_locales, "id", "name" FROM "products_colors";

   INSERT INTO "header_nav_items_locales" ("_locale", "_parent_id", "link_label")
   SELECT 'vi'::_locales, "id", "link_label" FROM "header_nav_items";

   INSERT INTO "pages_blocks_cta_links_locales" ("_locale", "_parent_id", "link_label")
   SELECT 'vi'::_locales, "id", "link_label" FROM "pages_blocks_cta_links" WHERE "link_label" IS NOT NULL;

   INSERT INTO "pages_blocks_content_columns_locales" ("_locale", "_parent_id", "link_label")
   SELECT 'vi'::_locales, "id", "link_label" FROM "pages_blocks_content_columns" WHERE "link_label" IS NOT NULL;

   INSERT INTO "_pages_v_blocks_cta_links_locales" ("_locale", "_parent_id", "link_label")
   SELECT 'vi'::_locales, "id", "link_label" FROM "_pages_v_blocks_cta_links" WHERE "link_label" IS NOT NULL;

   INSERT INTO "_pages_v_blocks_content_columns_locales" ("_locale", "_parent_id", "link_label")
   SELECT 'vi'::_locales, "id", "link_label" FROM "_pages_v_blocks_content_columns" WHERE "link_label" IS NOT NULL;`)

  // ── 3/3 — Drop the old scalar columns now that data is preserved ──────
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta_links" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_label";
  ALTER TABLE "pages" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_cta_links" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_title";
  ALTER TABLE "media" DROP COLUMN "caption";
  ALTER TABLE "products_colors" DROP COLUMN "name";
  ALTER TABLE "header_nav_items" DROP COLUMN "link_label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Re-add the scalar columns first so we have somewhere to copy the
  // VI values back to, then drop the locale tables / columns.
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta_links" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "media" ADD COLUMN "caption" jsonb;
  ALTER TABLE "products_colors" ADD COLUMN "name" varchar;
  ALTER TABLE "header_nav_items" ADD COLUMN "link_label" varchar;`)

  await db.execute(sql`
   UPDATE "pages" SET "title" = l."title"
     FROM "pages_locales" l WHERE l."_parent_id" = "pages"."id" AND l."_locale" = 'vi';
   UPDATE "_pages_v" SET "version_title" = l."version_title"
     FROM "_pages_v_locales" l WHERE l."_parent_id" = "_pages_v"."id" AND l."_locale" = 'vi';
   UPDATE "media" SET "caption" = l."caption"
     FROM "media_locales" l WHERE l."_parent_id" = "media"."id" AND l."_locale" = 'vi';
   UPDATE "products_colors" SET "name" = l."name"
     FROM "products_colors_locales" l WHERE l."_parent_id" = "products_colors"."id" AND l."_locale" = 'vi';
   UPDATE "header_nav_items" SET "link_label" = l."link_label"
     FROM "header_nav_items_locales" l WHERE l."_parent_id" = "header_nav_items"."id" AND l."_locale" = 'vi';
   UPDATE "pages_blocks_cta_links" SET "link_label" = l."link_label"
     FROM "pages_blocks_cta_links_locales" l WHERE l."_parent_id" = "pages_blocks_cta_links"."id" AND l."_locale" = 'vi';
   UPDATE "pages_blocks_content_columns" SET "link_label" = l."link_label"
     FROM "pages_blocks_content_columns_locales" l WHERE l."_parent_id" = "pages_blocks_content_columns"."id" AND l."_locale" = 'vi';
   UPDATE "_pages_v_blocks_cta_links" SET "link_label" = l."link_label"
     FROM "_pages_v_blocks_cta_links_locales" l WHERE l."_parent_id" = "_pages_v_blocks_cta_links"."id" AND l."_locale" = 'vi';
   UPDATE "_pages_v_blocks_content_columns" SET "link_label" = l."link_label"
     FROM "_pages_v_blocks_content_columns_locales" l WHERE l."_parent_id" = "_pages_v_blocks_content_columns"."id" AND l."_locale" = 'vi';
   ALTER TABLE "products_colors" ALTER COLUMN "name" SET NOT NULL;
   ALTER TABLE "header_nav_items" ALTER COLUMN "link_label" SET NOT NULL;`)

  await db.execute(sql`
   DROP TABLE "pages_blocks_cta_links_locales" CASCADE;
  DROP TABLE "pages_blocks_content_columns_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns_locales" CASCADE;
  DROP TABLE "products_colors_locales" CASCADE;
  DROP TABLE "header_nav_items_locales" CASCADE;
  ALTER TABLE "pages_locales" DROP COLUMN "title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_title";
  ALTER TABLE "media_locales" DROP COLUMN "caption";
  ALTER TABLE "users" DROP COLUMN "preferred_locale";
  ALTER TABLE "newsletter_subscribers" DROP COLUMN "preferred_locale";
  DROP TYPE "public"."enum_users_preferred_locale";
  DROP TYPE "public"."enum_newsletter_subscribers_preferred_locale";`)
}
