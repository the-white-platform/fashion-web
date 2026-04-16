import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "vto_generations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"product_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vto_generations_id" integer;
  ALTER TABLE "vto_generations" ADD CONSTRAINT "vto_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vto_generations" ADD CONSTRAINT "vto_generations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "vto_generations_user_idx" ON "vto_generations" USING btree ("user_id");
  CREATE INDEX "vto_generations_product_idx" ON "vto_generations" USING btree ("product_id");
  CREATE INDEX "vto_generations_updated_at_idx" ON "vto_generations" USING btree ("updated_at");
  CREATE INDEX "vto_generations_created_at_idx" ON "vto_generations" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vto_generations_fk" FOREIGN KEY ("vto_generations_id") REFERENCES "public"."vto_generations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_vto_generations_id_idx" ON "payload_locked_documents_rels" USING btree ("vto_generations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vto_generations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "vto_generations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vto_generations_fk";
  
  DROP INDEX "payload_locked_documents_rels_vto_generations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vto_generations_id";`)
}
