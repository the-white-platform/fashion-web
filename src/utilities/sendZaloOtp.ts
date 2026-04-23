import { zaloSendZNS } from '@/lib/zalo'
import { statusFromZnsResult, writeZaloDeliveryStatusByPhone } from './updateZaloDeliveryStatus'
import { logZnsResult, logZnsSend } from './logZnsSend'

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
  // The actual OTP code is sensitive — don't persist it in the
  // audit trail. Log a redacted marker instead.
  const redactedData = { otp: '<redacted>' }

  if (!templateId) {
    await logZnsSend({
      status: 'skipped',
      templateId: 'otp',
      phone: args.phone,
      templateData: redactedData,
      source: 'otp',
      errorMessage: 'ZALO_ZNS_OTP template id not configured',
    })
    return { delivered: false, reason: 'ZALO_ZNS_OTP template id not configured' }
  }

  const raw = args.phone.replace(/\D+/g, '')
  if (!raw) {
    await logZnsSend({
      status: 'skipped',
      templateId,
      phone: args.phone,
      templateData: redactedData,
      source: 'otp',
      errorMessage: 'Empty phone number',
    })
    return { delivered: false, reason: 'Empty phone number' }
  }

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
    await logZnsResult({
      templateId,
      phone: normalised,
      templateData: redactedData,
      source: 'otp',
      result,
    })
    if (result.ok) return { delivered: true }
    return {
      delivered: false,
      reason: `Zalo rejected: ${result.errorCode} ${result.errorMessage}`,
    }
  } catch (err) {
    await logZnsSend({
      status: 'error',
      templateId,
      phone: normalised,
      templateData: redactedData,
      source: 'otp',
      errorMessage: err instanceof Error ? err.message : String(err),
    })
    return {
      delivered: false,
      reason: err instanceof Error ? err.message : String(err),
    }
  }
}
