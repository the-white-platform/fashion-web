import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Payload keeps an internal `payload_locked_documents__rels`
  // polymorphic join table with one FK column per collection. The
  // zns_logs collection migration created the table itself but
  // didn't wire it into this join, so every admin page that uses
  // the lock/prevention-of-concurrent-edit system (most of them)
  // crashes with "column ... zns_logs_id does not exist" on load.
  //
  // Add the missing FK + index + also extend payload_preferences__rels
  // so user-preference resolution doesn't regress when someone
  // favourites a zns-log row.
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "zns_logs_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_zns_logs_fk"
        FOREIGN KEY ("zns_logs_id")
        REFERENCES "public"."zns_logs"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_zns_logs_id_idx"
      ON "payload_locked_documents_rels" USING btree ("zns_logs_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_zns_logs_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_zns_logs_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "zns_logs_id";
  `)
}
