import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Audit trail for every ZNS attempt. Status/source are Postgres
  // enums because Payload generates them that way when the select
  // field is written from the collection; do both up-front so the
  // migration is self-contained.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_zns_logs_status"
        AS ENUM ('sent', 'rejected', 'error', 'skipped');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_zns_logs_source"
        AS ENUM (
          'order-notification',
          'customer-welcome',
          'customer-discount',
          'otp',
          'admin-send',
          'admin-test'
        );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "zns_logs" (
      "id" serial PRIMARY KEY,
      "summary" varchar,
      "status" "public"."enum_zns_logs_status" DEFAULT 'sent' NOT NULL,
      "template_id" varchar NOT NULL,
      "phone" varchar NOT NULL,
      "recipient_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "initiator_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "template_data" jsonb,
      "error_code" numeric,
      "error_message" varchar,
      "coupon_id" integer REFERENCES "coupons"("id") ON DELETE SET NULL,
      "source" "public"."enum_zns_logs_source" DEFAULT 'order-notification',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "zns_logs_template_id_idx"
      ON "zns_logs" ("template_id");
    CREATE INDEX IF NOT EXISTS "zns_logs_phone_idx"
      ON "zns_logs" ("phone");
    CREATE INDEX IF NOT EXISTS "zns_logs_error_code_idx"
      ON "zns_logs" ("error_code");
    CREATE INDEX IF NOT EXISTS "zns_logs_created_at_idx"
      ON "zns_logs" ("created_at" DESC);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "zns_logs";
    DROP TYPE IF EXISTS "public"."enum_zns_logs_status";
    DROP TYPE IF EXISTS "public"."enum_zns_logs_source";
  `)
}
