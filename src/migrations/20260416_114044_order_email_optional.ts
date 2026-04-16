import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ALTER COLUMN "zalo_notifications" SET DEFAULT true;
  ALTER TABLE "orders" ALTER COLUMN "customer_info_customer_email" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ALTER COLUMN "zalo_notifications" SET DEFAULT false;
  ALTER TABLE "orders" ALTER COLUMN "customer_info_customer_email" SET NOT NULL;`)
}
