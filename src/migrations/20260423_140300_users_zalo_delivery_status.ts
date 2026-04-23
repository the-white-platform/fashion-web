import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Payload generates `enum_users_zalo_delivery_status` automatically on
  // schema push, but migrations must create it explicitly. Values match
  // the select options in collections/Users/index.ts.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_users_zalo_delivery_status"
        AS ENUM ('unknown', 'verified', 'not_on_zalo');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "zalo_delivery_status"
      "public"."enum_users_zalo_delivery_status" DEFAULT 'unknown';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "zalo_delivery_status";
    DROP TYPE IF EXISTS "public"."enum_users_zalo_delivery_status";
  `)
}
