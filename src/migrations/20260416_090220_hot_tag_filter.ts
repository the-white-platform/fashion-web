import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_homepage_quick_filters_tag_filter" ADD VALUE 'hot';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_quick_filters" ALTER COLUMN "tag_filter" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_quick_filters_tag_filter";
  CREATE TYPE "public"."enum_homepage_quick_filters_tag_filter" AS ENUM('sale', 'new', 'bestseller');
  ALTER TABLE "homepage_quick_filters" ALTER COLUMN "tag_filter" SET DATA TYPE "public"."enum_homepage_quick_filters_tag_filter" USING "tag_filter"::"public"."enum_homepage_quick_filters_tag_filter";`)
}
