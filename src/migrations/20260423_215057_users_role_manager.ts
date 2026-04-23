import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Postgres enum ADD VALUE is idempotent via IF NOT EXISTS, so
  // rerunning the migration during local development is safe.
  // The new `manager` role powers the /management dashboard
  // access gate without granting Payload admin privileges.
  await db.execute(sql`
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'manager';
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Postgres cannot drop enum values. Leaving `manager` in place
  // after a rollback is harmless — any user still holding that
  // role would simply have no effect in the UI.
}
