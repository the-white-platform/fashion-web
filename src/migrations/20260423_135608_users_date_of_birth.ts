import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Nullable so existing users don't break. We initially planned a
  // functional index on (EXTRACT(MONTH), EXTRACT(DAY)) to speed up
  // the birthday scan, but Postgres rejects that on timestamptz
  // columns — `EXTRACT(... FROM timestamptz)` is not marked
  // IMMUTABLE because its output depends on the session time zone.
  // A plain B-tree on date_of_birth doesn't help the upcoming-
  // birthdays query (it filters on (month, day) regardless of year),
  // so we skip the index entirely. The admin scan runs over a
  // bounded customer list and remains fast without one.
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "date_of_birth";
  `)
}
