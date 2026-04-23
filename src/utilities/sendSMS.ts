import type { Payload } from 'payload'
import type { Order } from '@/payload-types'

export type SMSTemplate =
  | 'orderConfirmation'
  | 'orderStatusUpdate'
  | 'shippingNotification'
  | 'deliveryConfirmation'
  | 'orderCancelled'
  | 'refundNotification'

interface SendSMSParams {
  payload: Payload
  phone: string
  order: Order
  template: SMSTemplate
  locale: 'vi' | 'en'
}

/**
 * Send an order SMS. Last-resort channel used only when Zalo ZNS
 * and email both fail / are unavailable. No provider is wired
 * yet, so this currently no-ops and returns `false`; the priority
 * chain in `sendOrderNotification` treats that as "try the next
 * channel". When we pick a provider (Twilio / eSMS / VietGuys /
 * SpeedSMS), dispatch here based on `SMS_PROVIDER`.
 */
export async function sendSMS({
  payload,
  phone,
  template,
  locale,
}: SendSMSParams): Promise<boolean> {
  const provider = process.env.SMS_PROVIDER?.trim()
  if (!provider) {
    payload.logger.info(`[sms] Skip "${template}" to ${phone} (SMS_PROVIDER not configured)`)
    return false
  }

  // Placeholder: no provider implemented yet. Log the intent so
  // we can see in prod logs when SMS would have fired, then
  // return false so the caller doesn't treat it as sent.
  payload.logger.warn(
    `[sms] SMS_PROVIDER="${provider}" configured but no dispatcher wired — skipping "${template}" to ${phone} (${locale})`,
  )
  return false
}
