import { zaloSendZNS } from '@/lib/zalo'
import { statusFromZnsResult, writeZaloDeliveryStatusByPhone } from './updateZaloDeliveryStatus'
import { logZnsResult, logZnsSend } from './logZnsSend'

/**
 * Send a CUSTOMER_DISCOUNT ZNS (template 572054). Used for
 * birthday / seasonal promo codes. Template parameter names come
 * straight from the Zalo OA dashboard — Zalo rejects the send if
 * any key is wrong, so this shape must match the template 1:1:
 *
 *   customer_name      string(30)   "Trần Duy Khánh"
 *   voucher_code       string(30)   "TW-123123123"
 *   voucher_discount   string(30)   "50%"
 *   expire_date        date(20)     "14/02/2026" (dd/MM/yyyy)
 *   voucher_condition  string(30)   "Sản phẩm bất kỳ"
 *   reason             string(30)   "Chúc mừng sinh nhật"
 *
 * Zalo enforces max lengths — callers must truncate / validate
 * upstream. `voucher_discount` is a string even for percentages
 * because the template formats it as-is.
 *
 * Returns `boolean` so callers can fall back to email / skip.
 * Never throws.
 */
export interface CustomerDiscountParams {
  phone: string
  customerName: string
  voucherCode: string
  voucherDiscount: string
  expireDate: string
  voucherCondition: string
  reason: string
}

export async function sendCustomerDiscount(params: CustomerDiscountParams): Promise<boolean> {
  const templateId = process.env.ZALO_ZNS_CUSTOMER_DISCOUNT
  const templateData = {
    customer_name: params.customerName,
    voucher_code: params.voucherCode,
    voucher_discount: params.voucherDiscount,
    expire_date: params.expireDate,
    voucher_condition: params.voucherCondition,
    reason: params.reason,
  }

  if (!templateId) {
    console.info('[sendCustomerDiscount] Skip — ZALO_ZNS_CUSTOMER_DISCOUNT not configured')
    await logZnsSend({
      status: 'skipped',
      templateId: 'customer_discount',
      phone: params.phone,
      templateData,
      source: 'customer-discount',
      errorMessage: 'ZALO_ZNS_CUSTOMER_DISCOUNT not configured',
    })
    return false
  }

  const raw = params.phone.replace(/\D+/g, '')
  if (!raw) {
    console.warn('[sendCustomerDiscount] Skip — empty phone number')
    await logZnsSend({
      status: 'skipped',
      templateId,
      phone: params.phone,
      templateData,
      source: 'customer-discount',
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
      trackingId: `discount-${params.voucherCode}-${Date.now()}`,
    })
    const derived = statusFromZnsResult(result)
    if (derived) await writeZaloDeliveryStatusByPhone(params.phone, derived)
    await logZnsResult({
      templateId,
      phone: normalised,
      templateData,
      source: 'customer-discount',
      result,
    })
    if (result.ok) {
      console.info(
        `[sendCustomerDiscount] Sent ${params.voucherCode} to ${normalised} (${params.voucherDiscount}, reason=${params.reason})`,
      )
      return true
    }
    console.warn(
      `[sendCustomerDiscount] Zalo rejected discount ZNS for ${normalised}: error=${result.errorCode} ${result.errorMessage}`,
    )
    return false
  } catch (err) {
    console.error('[sendCustomerDiscount] Failed:', err)
    await logZnsSend({
      status: 'error',
      templateId,
      phone: normalised,
      templateData,
      source: 'customer-discount',
      errorMessage: err instanceof Error ? err.message : String(err),
    })
    return false
  }
}
