import { zaloSendZNS } from '@/lib/zalo'
import { statusFromZnsResult, writeZaloDeliveryStatusByPhone } from './updateZaloDeliveryStatus'
import { logZnsResult, logZnsSend } from './logZnsSend'

/**
 * Send a WELCOME ZNS (template 572063). Fired the first time a
 * user's phone number is known to us.
 *
 * Known template parameters (from the OA dashboard):
 *   customer_name   string(30)   "Trần Duy Khánh"
 *   company_name    string(30)   "THE WHITE ACTIVE"
 *
 * The template may have additional params below what was visible
 * when this util was written — `extraData` passes arbitrary keys
 * straight through, so callers can fill in more fields once the
 * full schema is confirmed without another code change.
 */
export interface CustomerWelcomeParams {
  phone: string
  customerName: string
  companyName: string
  extraData?: Record<string, string>
}

export async function sendCustomerWelcome(params: CustomerWelcomeParams): Promise<boolean> {
  const templateId = process.env.ZALO_ZNS_WELCOME
  const templateData = {
    customer_name: params.customerName,
    company_name: params.companyName,
    ...(params.extraData ?? {}),
  }

  if (!templateId) {
    console.info('[sendCustomerWelcome] Skip — ZALO_ZNS_WELCOME not configured')
    await logZnsSend({
      status: 'skipped',
      templateId: 'customer_welcome',
      phone: params.phone,
      templateData,
      source: 'customer-welcome',
      errorMessage: 'ZALO_ZNS_WELCOME not configured',
    })
    return false
  }

  const raw = params.phone.replace(/\D+/g, '')
  if (!raw) {
    console.warn('[sendCustomerWelcome] Skip — empty phone number')
    await logZnsSend({
      status: 'skipped',
      templateId,
      phone: params.phone,
      templateData,
      source: 'customer-welcome',
      errorMessage: 'Empty phone number',
    })
    return false
  }
  const normalised = raw.startsWith('0') ? `84${raw.slice(1)}` : raw

  try {
    const result = await zaloSendZNS({
      phone: normalised,
      templateId,
      templateData,
      trackingId: `welcome-${Date.now()}`,
    })
    const derived = statusFromZnsResult(result)
    if (derived) await writeZaloDeliveryStatusByPhone(params.phone, derived)
    await logZnsResult({
      templateId,
      phone: normalised,
      templateData,
      source: 'customer-welcome',
      result,
    })
    if (result.ok) {
      console.info(`[sendCustomerWelcome] Sent welcome to ${normalised} (${params.customerName})`)
      return true
    }
    console.warn(
      `[sendCustomerWelcome] Zalo rejected welcome for ${normalised}: error=${result.errorCode} ${result.errorMessage}`,
    )
    return false
  } catch (err) {
    console.error('[sendCustomerWelcome] Failed:', err)
    await logZnsSend({
      status: 'error',
      templateId,
      phone: normalised,
      templateData,
      source: 'customer-welcome',
      errorMessage: err instanceof Error ? err.message : String(err),
    })
    return false
  }
}
