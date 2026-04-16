import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "chat_context" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "chat_context_locales" (
  	"brand_bio" varchar,
  	"size_guide" varchar,
  	"shipping_policy" varchar,
  	"return_policy" varchar,
  	"contact_info" varchar,
  	"tone_prompt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "chat_context_locales" ADD CONSTRAINT "chat_context_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chat_context"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "chat_context_locales_locale_parent_id_unique" ON "chat_context_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "chat_context" CASCADE;
  DROP TABLE "chat_context_locales" CASCADE;`)
}
