import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_carousel_slides_locales" (
  	"title" varchar NOT NULL,
  	"subtitle" varchar NOT NULL,
  	"cta_text" varchar DEFAULT 'Explore Now' NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_quick_filters_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "homepage_carousel_slides_locales" ADD CONSTRAINT "homepage_carousel_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_carousel_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_quick_filters_locales" ADD CONSTRAINT "homepage_quick_filters_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_quick_filters"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "homepage_carousel_slides_locales_locale_parent_id_unique" ON "homepage_carousel_slides_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "homepage_quick_filters_locales_locale_parent_id_unique" ON "homepage_quick_filters_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "homepage_carousel_slides" DROP COLUMN "title";
  ALTER TABLE "homepage_carousel_slides" DROP COLUMN "subtitle";
  ALTER TABLE "homepage_carousel_slides" DROP COLUMN "cta_text";
  ALTER TABLE "homepage_quick_filters" DROP COLUMN "label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_carousel_slides_locales" CASCADE;
  DROP TABLE "homepage_quick_filters_locales" CASCADE;
  ALTER TABLE "homepage_carousel_slides" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "homepage_carousel_slides" ADD COLUMN "subtitle" varchar NOT NULL;
  ALTER TABLE "homepage_carousel_slides" ADD COLUMN "cta_text" varchar DEFAULT 'Explore Now' NOT NULL;
  ALTER TABLE "homepage_quick_filters" ADD COLUMN "label" varchar NOT NULL;`)
}
