import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "company_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"website_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "company_info_locales" (
  	"company_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "company_info_locales" ADD CONSTRAINT "company_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "company_info_locales_locale_parent_id_unique" ON "company_info_locales" USING btree ("_locale","_parent_id");

  -- Seed the global with real brand details so privacy-policy / terms-of-use
  -- render correct contact info on first paint. Admin can edit later at
  -- /admin/globals/company-info. ON CONFLICT keeps re-runs idempotent.
  INSERT INTO "company_info" ("id", "email", "phone", "website_url", "created_at", "updated_at")
  VALUES (1, 'contact@thewhite.cool', '+84 886 402 616', 'thewhite.cool', NOW(), NOW())
  ON CONFLICT ("id") DO NOTHING;

  INSERT INTO "company_info_locales" ("company_name", "_locale", "_parent_id")
  VALUES ('Công ty The White Active', 'vi', 1)
  ON CONFLICT ("_locale", "_parent_id") DO NOTHING;

  INSERT INTO "company_info_locales" ("company_name", "_locale", "_parent_id")
  VALUES ('The White Active', 'en', 1)
  ON CONFLICT ("_locale", "_parent_id") DO NOTHING;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "company_info" CASCADE;
  DROP TABLE "company_info_locales" CASCADE;`)
}
