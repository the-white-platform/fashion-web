import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_vto_generations_provider" AS ENUM('vertex', 'gemini');
  ALTER TABLE "vto_generations" ADD COLUMN "provider" "enum_vto_generations_provider";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vto_generations" DROP COLUMN "provider";
  DROP TYPE "public"."enum_vto_generations_provider";`)
}
