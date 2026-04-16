import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vto_generations" ADD COLUMN "input_hash" varchar;
  ALTER TABLE "vto_generations" ADD COLUMN "result_data" varchar;
  CREATE INDEX "vto_generations_input_hash_idx" ON "vto_generations" USING btree ("input_hash");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "vto_generations_input_hash_idx";
  ALTER TABLE "vto_generations" DROP COLUMN "input_hash";
  ALTER TABLE "vto_generations" DROP COLUMN "result_data";`)
}
