import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// ─────────────────────────────────────────────────────────────────────────────
// Extend the CompanyInfo global with the fields needed for the Bộ Công Thương
// / Google Merchant disclosure block shown in the site footer:
//
//   company_info.legal_entity_name           (household business legal name)
//   company_info.tax_code                    (mã số hộ kinh doanh)
//   company_info.registration_date           (first issuance date)
//   company_info_locales.address             (localized registered address)
//   company_info_locales.registration_authority  (localized issuing authority)
//
// All columns are nullable — admins populate them once via the Payload admin.
// ─────────────────────────────────────────────────────────────────────────────

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "company_info" ADD COLUMN IF NOT EXISTS "legal_entity_name" varchar;
    ALTER TABLE "company_info" ADD COLUMN IF NOT EXISTS "tax_code" varchar;
    ALTER TABLE "company_info" ADD COLUMN IF NOT EXISTS "registration_date" timestamp(3) with time zone;
    ALTER TABLE "company_info_locales" ADD COLUMN IF NOT EXISTS "address" varchar;
    ALTER TABLE "company_info_locales" ADD COLUMN IF NOT EXISTS "registration_authority" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "company_info_locales" DROP COLUMN IF EXISTS "registration_authority";
    ALTER TABLE "company_info_locales" DROP COLUMN IF EXISTS "address";
    ALTER TABLE "company_info" DROP COLUMN IF EXISTS "registration_date";
    ALTER TABLE "company_info" DROP COLUMN IF EXISTS "tax_code";
    ALTER TABLE "company_info" DROP COLUMN IF EXISTS "legal_entity_name";
  `)
}
