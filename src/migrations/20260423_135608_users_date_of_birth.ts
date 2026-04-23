import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Nullable so existing users don't break. Birthday discount ZNS
  // scan uses an index on (month, day) extracted from this column.
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" timestamp(3) with time zone;
    CREATE INDEX IF NOT EXISTS "users_date_of_birth_mmdd_idx"
      ON "users" (EXTRACT(MONTH FROM "date_of_birth"), EXTRACT(DAY FROM "date_of_birth"));
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_date_of_birth_mmdd_idx";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "date_of_birth";
  `)
}
