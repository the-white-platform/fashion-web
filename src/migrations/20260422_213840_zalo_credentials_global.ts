import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "zalo_credentials" (
      "id" serial PRIMARY KEY NOT NULL,
      "refresh_token" varchar,
      "refresh_token_issued_at" timestamp(3) with time zone,
      "refresh_token_expires_at" timestamp(3) with time zone,
      "access_token" varchar,
      "access_token_expires_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "zalo_credentials";
  `)
}
