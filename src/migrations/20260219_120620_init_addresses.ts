import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_payment_methods_type" AS ENUM('card', 'bank', 'cod', 'momo');
  CREATE TYPE "public"."enum_users_provider" AS ENUM('local', 'google', 'facebook');
  CREATE TABLE "users_shipping_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"city_id" integer NOT NULL,
  	"district_id" integer NOT NULL,
  	"ward_id" integer,
  	"is_default" boolean
  );
  
  CREATE TABLE "users_payment_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_users_payment_methods_type",
  	"card_number" varchar,
  	"is_default" boolean
  );
  
  CREATE TABLE "provinces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "districts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"province_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"district_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "sub" varchar;
  ALTER TABLE "users" ADD COLUMN "provider" "enum_users_provider" DEFAULT 'local';
  ALTER TABLE "users" ADD COLUMN "image_url" varchar;
  ALTER TABLE "users" ADD COLUMN "order_history" jsonb;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_ward_id" integer;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_district_id" integer NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_city_id" integer NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "provinces_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "districts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "wards_id" integer;
  ALTER TABLE "users_shipping_addresses" ADD CONSTRAINT "users_shipping_addresses_city_id_provinces_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."provinces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_shipping_addresses" ADD CONSTRAINT "users_shipping_addresses_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_shipping_addresses" ADD CONSTRAINT "users_shipping_addresses_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_shipping_addresses" ADD CONSTRAINT "users_shipping_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_payment_methods" ADD CONSTRAINT "users_payment_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "districts" ADD CONSTRAINT "districts_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wards" ADD CONSTRAINT "wards_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_shipping_addresses_order_idx" ON "users_shipping_addresses" USING btree ("_order");
  CREATE INDEX "users_shipping_addresses_parent_id_idx" ON "users_shipping_addresses" USING btree ("_parent_id");
  CREATE INDEX "users_shipping_addresses_city_idx" ON "users_shipping_addresses" USING btree ("city_id");
  CREATE INDEX "users_shipping_addresses_district_idx" ON "users_shipping_addresses" USING btree ("district_id");
  CREATE INDEX "users_shipping_addresses_ward_idx" ON "users_shipping_addresses" USING btree ("ward_id");
  CREATE INDEX "users_payment_methods_order_idx" ON "users_payment_methods" USING btree ("_order");
  CREATE INDEX "users_payment_methods_parent_id_idx" ON "users_payment_methods" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "provinces_code_idx" ON "provinces" USING btree ("code");
  CREATE INDEX "provinces_updated_at_idx" ON "provinces" USING btree ("updated_at");
  CREATE INDEX "provinces_created_at_idx" ON "provinces" USING btree ("created_at");
  CREATE UNIQUE INDEX "districts_code_idx" ON "districts" USING btree ("code");
  CREATE INDEX "districts_province_idx" ON "districts" USING btree ("province_id");
  CREATE INDEX "districts_updated_at_idx" ON "districts" USING btree ("updated_at");
  CREATE INDEX "districts_created_at_idx" ON "districts" USING btree ("created_at");
  CREATE UNIQUE INDEX "wards_code_idx" ON "wards" USING btree ("code");
  CREATE INDEX "wards_district_idx" ON "wards" USING btree ("district_id");
  CREATE INDEX "wards_updated_at_idx" ON "wards" USING btree ("updated_at");
  CREATE INDEX "wards_created_at_idx" ON "wards" USING btree ("created_at");
  ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_ward_id_wards_id_fk" FOREIGN KEY ("shipping_address_ward_id") REFERENCES "public"."wards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_district_id_districts_id_fk" FOREIGN KEY ("shipping_address_district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_city_id_provinces_id_fk" FOREIGN KEY ("shipping_address_city_id") REFERENCES "public"."provinces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_provinces_fk" FOREIGN KEY ("provinces_id") REFERENCES "public"."provinces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_districts_fk" FOREIGN KEY ("districts_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wards_fk" FOREIGN KEY ("wards_id") REFERENCES "public"."wards"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sub_idx" ON "users" USING btree ("sub");
  CREATE INDEX "orders_shipping_address_shipping_address_ward_idx" ON "orders" USING btree ("shipping_address_ward_id");
  CREATE INDEX "orders_shipping_address_shipping_address_district_idx" ON "orders" USING btree ("shipping_address_district_id");
  CREATE INDEX "orders_shipping_address_shipping_address_city_idx" ON "orders" USING btree ("shipping_address_city_id");
  CREATE INDEX "payload_locked_documents_rels_provinces_id_idx" ON "payload_locked_documents_rels" USING btree ("provinces_id");
  CREATE INDEX "payload_locked_documents_rels_districts_id_idx" ON "payload_locked_documents_rels" USING btree ("districts_id");
  CREATE INDEX "payload_locked_documents_rels_wards_id_idx" ON "payload_locked_documents_rels" USING btree ("wards_id");
  ALTER TABLE "orders" DROP COLUMN "shipping_address_ward";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_district";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_city";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_shipping_addresses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_payment_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "provinces" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "districts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wards" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_shipping_addresses" CASCADE;
  DROP TABLE "users_payment_methods" CASCADE;
  DROP TABLE "provinces" CASCADE;
  DROP TABLE "districts" CASCADE;
  DROP TABLE "wards" CASCADE;
  ALTER TABLE "orders" DROP CONSTRAINT "orders_shipping_address_ward_id_wards_id_fk";
  
  ALTER TABLE "orders" DROP CONSTRAINT "orders_shipping_address_district_id_districts_id_fk";
  
  ALTER TABLE "orders" DROP CONSTRAINT "orders_shipping_address_city_id_provinces_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_provinces_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_districts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_wards_fk";
  
  DROP INDEX "users_sub_idx";
  DROP INDEX "orders_shipping_address_shipping_address_ward_idx";
  DROP INDEX "orders_shipping_address_shipping_address_district_idx";
  DROP INDEX "orders_shipping_address_shipping_address_city_idx";
  DROP INDEX "payload_locked_documents_rels_provinces_id_idx";
  DROP INDEX "payload_locked_documents_rels_districts_id_idx";
  DROP INDEX "payload_locked_documents_rels_wards_id_idx";
  ALTER TABLE "orders" ADD COLUMN "shipping_address_ward" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_district" varchar NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_city" varchar NOT NULL;
  ALTER TABLE "users" DROP COLUMN "sub";
  ALTER TABLE "users" DROP COLUMN "provider";
  ALTER TABLE "users" DROP COLUMN "image_url";
  ALTER TABLE "users" DROP COLUMN "order_history";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_ward_id";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_district_id";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_city_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "provinces_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "districts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "wards_id";
  DROP TYPE "public"."enum_users_payment_methods_type";
  DROP TYPE "public"."enum_users_provider";`)
}
