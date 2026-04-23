import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ZaloZNSResult } from '@/lib/zalo'

export type ZaloDeliveryStatus = 'unknown' | 'verified' | 'not_on_zalo'

// Zalo error codes that confirm the phone isn't on Zalo. Any
// other non-zero code (template rejected, rate limit, etc.) is
// about the send, not the recipient — leave status as-is.
const NOT_ON_ZALO_CODES = new Set<number>([-124, -129])

/**
 * Translate a `zaloSendZNS` result into the user-facing delivery
 * status. Returns `null` when the result isn't conclusive about
 * the recipient (e.g. template rejection) so the caller doesn't
 * overwrite a previously-confirmed `verified` state.
 */
export function statusFromZnsResult(result: ZaloZNSResult): ZaloDeliveryStatus | null {
  if (result.ok) return 'verified'
  if (NOT_ON_ZALO_CODES.has(result.errorCode)) return 'not_on_zalo'
  return null
}

/**
 * Persist the derived delivery status on the user. Silent on
 * failure — this is a best-effort bookkeeping write and must
 * never break the caller's send flow.
 */
export async function writeZaloDeliveryStatus(
  userId: string | number,
  status: ZaloDeliveryStatus,
): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'users',
      id: userId,
      data: { zaloDeliveryStatus: status },
      overrideAccess: true,
    })
  } catch (err) {
    console.warn(
      `[writeZaloDeliveryStatus] Failed for user ${userId}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

/**
 * Convenience: look a user up by E.164 / 84xxxxxxxxx / 0xxxxxxxxx
 * phone and update their status. Used when the caller doesn't
 * already have the user id in hand (e.g. OTP sent by phone number
 * before an account exists).
 */
export async function writeZaloDeliveryStatusByPhone(
  phone: string,
  status: ZaloDeliveryStatus,
): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })
    const digits = phone.replace(/\D+/g, '')
    // Consider the most common storage formats.
    const candidates = new Set<string>([phone])
    if (digits) candidates.add(digits)
    if (digits.startsWith('84')) candidates.add(`0${digits.slice(2)}`)
    if (digits.startsWith('0')) candidates.add(`84${digits.slice(1)}`)

    const result = await payload.find({
      collection: 'users',
      where: { phone: { in: Array.from(candidates) } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const user = result.docs[0]
    if (!user) return
    await writeZaloDeliveryStatus(user.id, status)
  } catch (err) {
    console.warn(
      `[writeZaloDeliveryStatusByPhone] Failed for ${phone}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
