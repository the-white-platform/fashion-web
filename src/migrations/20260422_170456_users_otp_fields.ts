import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "otp_hash" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "otp_expires_at" timestamp(3) with time zone;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "otp_requested_at" timestamp(3) with time zone;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "otp_hash";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "otp_expires_at";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "otp_requested_at";
  `)
}
