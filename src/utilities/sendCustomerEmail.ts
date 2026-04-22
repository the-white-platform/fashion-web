import type { Payload } from 'payload'
import type { Order } from '@/payload-types'

import { orderConfirmation } from '@/emails/orderConfirmation'
import { orderStatusUpdate } from '@/emails/orderStatusUpdate'
import { shippingNotification } from '@/emails/shippingNotification'
import { deliveryConfirmation } from '@/emails/deliveryConfirmation'
import { refundNotification } from '@/emails/refundNotification'
import { passwordReset } from '@/emails/passwordReset'
import { otp } from '@/emails/otp'

type Locale = 'vi' | 'en'

type OrderEmailTemplate =
  | 'orderConfirmation'
  | 'orderStatusUpdate'
  | 'shippingNotification'
  | 'deliveryConfirmation'
  | 'refundNotification'

type PasswordResetTemplate = 'passwordReset'

type OtpTemplate = 'otp'

type OtpPurpose = 'login' | 'signup' | 'reset_password' | 'verify_email' | 'two_factor'

type OrderEmailParams = {
  payload: Payload
  to: string
  template: OrderEmailTemplate
  data: { order: Order; locale: Locale }
}

type PasswordResetParams = {
  payload: Payload
  to: string
  template: PasswordResetTemplate
  data: { resetLink: string; locale: Locale }
}

type OtpParams = {
  payload: Payload
  to: string
  template: OtpTemplate
  data: {
    code: string
    locale: Locale
    purpose?: OtpPurpose
    expiresInMinutes?: number
  }
}

type SendCustomerEmailParams = OrderEmailParams | PasswordResetParams | OtpParams

const resolveTemplate = (params: SendCustomerEmailParams): { subject: string; html: string } => {
  if (params.template === 'passwordReset') {
    return passwordReset({
      resetLink: params.data.resetLink,
      locale: params.data.locale,
    })
  }

  if (params.template === 'otp') {
    return otp({
      code: params.data.code,
      locale: params.data.locale,
      purpose: params.data.purpose,
      expiresInMinutes: params.data.expiresInMinutes,
    })
  }

  const { order, locale } = params.data

  switch (params.template) {
    case 'orderConfirmation':
      return orderConfirmation({ order, locale })
    case 'orderStatusUpdate':
      return orderStatusUpdate({ order, locale })
    case 'shippingNotification':
      return shippingNotification({ order, locale })
    case 'deliveryConfirmation':
      return deliveryConfirmation({ order, locale })
    case 'refundNotification':
      return refundNotification({ order, locale })
  }
}

export const sendCustomerEmail = async (params: SendCustomerEmailParams): Promise<void> => {
  const { payload, to } = params

  // No email provider yet — skip silently. Without this guard the
  // Resend adapter (configured with an empty api key) hangs the request
  // for ~300s on `payload.sendEmail`, which in turn hangs order creation
  // because `sendOrderEmails` is an afterChange hook awaited by Payload.
  if (!process.env.RESEND_API_KEY) {
    payload.logger.info(`[email] Skipping "${params.template}" to ${to} (no RESEND_API_KEY)`)
    return
  }

  try {
    const { subject, html } = resolveTemplate(params)

    // Cap the send at 10s so a dead upstream can't hang the checkout.
    await Promise.race([
      payload.sendEmail({ to, subject, html }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('sendEmail timeout after 10s')), 10_000),
      ),
    ])

    payload.logger.info(`[email] Sent "${params.template}" to ${to}`)
  } catch (err) {
    payload.logger.error(
      `[email] Failed to send "${params.template}" to ${to}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
