import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add `zalo` as a valid provider value. Postgres ADD VALUE is
  // idempotent via IF NOT EXISTS, so rerunning the migration is
  // safe during local development.
  await db.execute(sql`
    ALTER TYPE "public"."enum_users_provider" ADD VALUE IF NOT EXISTS 'zalo';
    CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users" USING btree ("phone");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Postgres cannot drop enum values, so the down migration only
  // rolls back the index. The `zalo` provider value becomes
  // orphaned on the enum but remains harmless.
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_phone_idx";
  `)
}
