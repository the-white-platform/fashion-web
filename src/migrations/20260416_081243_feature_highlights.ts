import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_homepage_feature_highlights_icon" AS ENUM('zap', 'trending', 'award', 'users', 'flag', 'heart', 'sparkles', 'shield', 'truck', 'leaf');
  CREATE TABLE "homepage_feature_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_homepage_feature_highlights_icon" DEFAULT 'sparkles' NOT NULL
  );
  
  CREATE TABLE "homepage_feature_highlights_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "homepage_feature_highlights" ADD CONSTRAINT "homepage_feature_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_feature_highlights_locales" ADD CONSTRAINT "homepage_feature_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_feature_highlights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_feature_highlights_order_idx" ON "homepage_feature_highlights" USING btree ("_order");
  CREATE INDEX "homepage_feature_highlights_parent_id_idx" ON "homepage_feature_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_feature_highlights_locales_locale_parent_id_unique" ON "homepage_feature_highlights_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_feature_highlights" CASCADE;
  DROP TABLE "homepage_feature_highlights_locales" CASCADE;
  DROP TYPE "public"."enum_homepage_feature_highlights_icon";`)
}
