import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vto_generations" ADD COLUMN "cache_hit" boolean DEFAULT false NOT NULL;
  CREATE INDEX "vto_generations_cache_hit_idx" ON "vto_generations" USING btree ("cache_hit");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "vto_generations_cache_hit_idx";
  ALTER TABLE "vto_generations" DROP COLUMN "cache_hit";`)
}
