import { zaloSendZNS } from '@/lib/zalo'
import { statusFromZnsResult, writeZaloDeliveryStatusByPhone } from './updateZaloDeliveryStatus'

/**
 * Deliver a one-time passcode via Zalo ZNS to the customer's
 * phone. Used as a fallback for phone-only / Zalo-only accounts
 * where the stored email is a synthetic placeholder and real
 * email delivery isn't possible.
 *
 * Returns `{ delivered: true }` on success, `{ delivered: false,
 * reason }` on configuration miss or API failure. Never throws —
 * callers fall back to email (or surface the reason) without
 * breaking the login flow.
 *
 * ZNS template must have a single `otp` parameter. Template ID
 * comes from `ZALO_ZNS_OTP` env var.
 */
export async function sendZaloOtp(args: {
  phone: string
  code: string
}): Promise<{ delivered: true } | { delivered: false; reason: string }> {
  const templateId = process.env.ZALO_ZNS_OTP
  if (!templateId) {
    return { delivered: false, reason: 'ZALO_ZNS_OTP template id not configured' }
  }

  const raw = args.phone.replace(/\D+/g, '')
  if (!raw) return { delivered: false, reason: 'Empty phone number' }

  // Zalo expects 84xxxxxxxxx (no leading +). `0xxxxxxxxx` →
  // strip leading 0, prepend 84. Already-84-prefixed numbers
  // pass through.
  const normalised = raw.startsWith('0') ? `84${raw.slice(1)}` : raw

  try {
    const result = await zaloSendZNS({
      phone: normalised,
      templateId,
      templateData: { otp: args.code },
      trackingId: `otp-${Date.now()}`,
    })
    const derived = statusFromZnsResult(result)
    if (derived) await writeZaloDeliveryStatusByPhone(args.phone, derived)
    if (result.ok) return { delivered: true }
    return {
      delivered: false,
      reason: `Zalo rejected: ${result.errorCode} ${result.errorMessage}`,
    }
  } catch (err) {
    return {
      delivered: false,
      reason: err instanceof Error ? err.message : String(err),
    }
  }
}
