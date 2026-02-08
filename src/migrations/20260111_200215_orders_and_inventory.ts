import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_color_variants_size_inventory_size" AS ENUM('XS', 'S', 'M', 'L', 'XL', '2X', '39', '40', '41', '42', '43', '44', '45');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('cod', 'bank_transfer', 'qr_code', 'vnpay', 'stripe', 'momo');
  CREATE TYPE "public"."enum_orders_payment_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
  CREATE TABLE "products_color_variants_size_inventory" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_products_color_variants_size_inventory_size" NOT NULL,
  	"stock" numeric DEFAULT 0 NOT NULL,
  	"low_stock_threshold" numeric DEFAULT 5
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"product_name" varchar NOT NULL,
  	"variant" varchar,
  	"size" varchar NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"line_total" numeric NOT NULL,
  	"product_image" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"customer_info_customer_name" varchar NOT NULL,
  	"customer_info_customer_email" varchar NOT NULL,
  	"customer_info_customer_phone" varchar NOT NULL,
  	"customer_info_user_id" integer,
  	"shipping_address_address" varchar NOT NULL,
  	"shipping_address_ward" varchar,
  	"shipping_address_district" varchar NOT NULL,
  	"shipping_address_city" varchar NOT NULL,
  	"shipping_address_postal_code" varchar,
  	"shipping_address_notes" varchar,
  	"payment_method" "enum_orders_payment_method" NOT NULL,
  	"payment_payment_status" "enum_orders_payment_payment_status" DEFAULT 'pending' NOT NULL,
  	"payment_transaction_id" varchar,
  	"payment_paid_at" timestamp(3) with time zone,
  	"totals_subtotal" numeric NOT NULL,
  	"totals_shipping_fee" numeric DEFAULT 0,
  	"totals_discount" numeric DEFAULT 0,
  	"totals_total" numeric NOT NULL,
  	"totals_coupon_code" varchar,
  	"admin_notes" varchar,
  	"fulfillment_carrier" varchar,
  	"fulfillment_tracking_number" varchar,
  	"fulfillment_shipped_at" timestamp(3) with time zone,
  	"fulfillment_delivered_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payment_methods" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cod_enabled" boolean DEFAULT true,
  	"cod_icon_id" integer,
  	"cod_sort_order" numeric DEFAULT 1,
  	"bank_transfer_enabled" boolean DEFAULT true,
  	"bank_transfer_icon_id" integer,
  	"bank_transfer_bank_name" varchar,
  	"bank_transfer_account_number" varchar,
  	"bank_transfer_account_name" varchar,
  	"bank_transfer_branch" varchar,
  	"bank_transfer_sort_order" numeric DEFAULT 2,
  	"qr_code_enabled" boolean DEFAULT true,
  	"qr_code_icon_id" integer,
  	"qr_code_qr_image_id" integer,
  	"qr_code_sort_order" numeric DEFAULT 3,
  	"vnpay_enabled" boolean DEFAULT false,
  	"vnpay_icon_id" integer,
  	"vnpay_sort_order" numeric DEFAULT 4,
  	"stripe_enabled" boolean DEFAULT false,
  	"stripe_icon_id" integer,
  	"stripe_sort_order" numeric DEFAULT 5,
  	"momo_enabled" boolean DEFAULT false,
  	"momo_icon_id" integer,
  	"momo_sort_order" numeric DEFAULT 6,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payment_methods_locales" (
  	"cod_name" varchar DEFAULT 'Thanh toán khi nhận hàng',
  	"cod_description" varchar,
  	"bank_transfer_name" varchar DEFAULT 'Chuyển khoản ngân hàng',
  	"bank_transfer_description" varchar,
  	"qr_code_name" varchar DEFAULT 'Thanh toán bằng mã QR',
  	"qr_code_description" varchar,
  	"qr_code_instructions" jsonb,
  	"vnpay_name" varchar DEFAULT 'VNPay',
  	"vnpay_description" varchar,
  	"stripe_name" varchar DEFAULT 'Credit/Debit Card',
  	"stripe_description" varchar,
  	"momo_name" varchar DEFAULT 'Ví MoMo',
  	"momo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "products_color_variants_sizes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_color_variants_sizes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "products_color_variants_size_inventory" ADD CONSTRAINT "products_color_variants_size_inventory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_color_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_info_user_id_users_id_fk" FOREIGN KEY ("customer_info_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_cod_icon_id_media_id_fk" FOREIGN KEY ("cod_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_bank_transfer_icon_id_media_id_fk" FOREIGN KEY ("bank_transfer_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_qr_code_icon_id_media_id_fk" FOREIGN KEY ("qr_code_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_qr_code_qr_image_id_media_id_fk" FOREIGN KEY ("qr_code_qr_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_vnpay_icon_id_media_id_fk" FOREIGN KEY ("vnpay_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_stripe_icon_id_media_id_fk" FOREIGN KEY ("stripe_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_momo_icon_id_media_id_fk" FOREIGN KEY ("momo_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_methods_locales" ADD CONSTRAINT "payment_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payment_methods"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_color_variants_size_inventory_order_idx" ON "products_color_variants_size_inventory" USING btree ("_order");
  CREATE INDEX "products_color_variants_size_inventory_parent_id_idx" ON "products_color_variants_size_inventory" USING btree ("_parent_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_customer_info_customer_info_user_idx" ON "orders" USING btree ("customer_info_user_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "payment_methods_cod_cod_icon_idx" ON "payment_methods" USING btree ("cod_icon_id");
  CREATE INDEX "payment_methods_bank_transfer_bank_transfer_icon_idx" ON "payment_methods" USING btree ("bank_transfer_icon_id");
  CREATE INDEX "payment_methods_qr_code_qr_code_icon_idx" ON "payment_methods" USING btree ("qr_code_icon_id");
  CREATE INDEX "payment_methods_qr_code_qr_code_qr_image_idx" ON "payment_methods" USING btree ("qr_code_qr_image_id");
  CREATE INDEX "payment_methods_vnpay_vnpay_icon_idx" ON "payment_methods" USING btree ("vnpay_icon_id");
  CREATE INDEX "payment_methods_stripe_stripe_icon_idx" ON "payment_methods" USING btree ("stripe_icon_id");
  CREATE INDEX "payment_methods_momo_momo_icon_idx" ON "payment_methods" USING btree ("momo_icon_id");
  CREATE UNIQUE INDEX "payment_methods_locales_locale_parent_id_unique" ON "payment_methods_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  ALTER TABLE "products_color_variants" DROP COLUMN "in_stock";
  DROP TYPE "public"."enum_products_color_variants_sizes";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_color_variants_sizes" AS ENUM('XS', 'S', 'M', 'L', 'XL', '2X', '39', '40', '41', '42', '43', '44', '45');
  CREATE TABLE "products_color_variants_sizes" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_products_color_variants_sizes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "products_color_variants_size_inventory" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payment_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payment_methods_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_color_variants_size_inventory" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "payment_methods" CASCADE;
  DROP TABLE "payment_methods_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  ALTER TABLE "products_color_variants" ADD COLUMN "in_stock" boolean DEFAULT true;
  ALTER TABLE "products_color_variants_sizes" ADD CONSTRAINT "products_color_variants_sizes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products_color_variants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_color_variants_sizes_order_idx" ON "products_color_variants_sizes" USING btree ("order");
  CREATE INDEX "products_color_variants_sizes_parent_idx" ON "products_color_variants_sizes" USING btree ("parent_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  DROP TYPE "public"."enum_products_color_variants_size_inventory_size";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_orders_payment_payment_status";`)
}
