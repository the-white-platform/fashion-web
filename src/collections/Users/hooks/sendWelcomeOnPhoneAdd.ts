import type { CollectionAfterChangeHook } from 'payload'
import type { User } from '@/payload-types'
import { sendCustomerWelcome } from '@/utilities/sendCustomerWelcome'
import { getCompanyInfo } from '@/utilities/getCompanyInfo'

const DEFAULT_COMPANY_NAME = 'THE WHITE ACTIVE'

function normalizePhone(v: unknown): string {
  if (typeof v !== 'string') return ''
  return v.trim()
}

/**
 * Fire the welcome ZNS template (572063) the first time a user's
 * phone number becomes known to us. Triggers on:
 *   - create → new account already includes a phone (typical for
 *     phone-only signup + Zalo OAuth callbacks)
 *   - update → previous phone was empty, new phone is set (user
 *     added a phone to a previously email-only account)
 *
 * Never fires on phone changes (empty → X is a first-time-add,
 * X → Y is a correction and shouldn't spam the customer).
 * Admin / editor / staff accounts are skipped.
 */
export const sendWelcomeOnPhoneAdd: CollectionAfterChangeHook<User> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (doc.role === 'admin' || doc.role === 'editor' || doc.role === 'staff') return doc
  if (doc.zaloNotifications === false) return doc

  const newPhone = normalizePhone(doc.phone)
  if (!newPhone) return doc

  const prevPhone =
    operation === 'update' ? normalizePhone((previousDoc as { phone?: string } | null)?.phone) : ''

  const isFirstTime = operation === 'create' ? true : !prevPhone
  if (!isFirstTime) return doc

  try {
    const locale = (doc as { preferredLocale?: 'vi' | 'en' }).preferredLocale ?? 'vi'
    const company = await getCompanyInfo(locale).catch(() => null)
    const companyName =
      (company as { companyName?: string } | null)?.companyName?.trim() || DEFAULT_COMPANY_NAME

    await sendCustomerWelcome({
      phone: newPhone,
      customerName: doc.name?.trim() || 'Khách hàng',
      companyName,
    })
  } catch (err) {
    req.payload.logger.error(
      `[sendWelcomeOnPhoneAdd] Failed for user ${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return doc
}
