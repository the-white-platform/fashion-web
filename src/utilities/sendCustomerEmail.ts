import type { Payload } from 'payload'
import type { Order } from '@/payload-types'

import { orderConfirmation } from '@/emails/orderConfirmation'
import { orderStatusUpdate } from '@/emails/orderStatusUpdate'
import { shippingNotification } from '@/emails/shippingNotification'
import { deliveryConfirmation } from '@/emails/deliveryConfirmation'
import { refundNotification } from '@/emails/refundNotification'
import { passwordReset } from '@/emails/passwordReset'

type Locale = 'vi' | 'en'

type OrderEmailTemplate =
  | 'orderConfirmation'
  | 'orderStatusUpdate'
  | 'shippingNotification'
  | 'deliveryConfirmation'
  | 'refundNotification'

type PasswordResetTemplate = 'passwordReset'

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

type SendCustomerEmailParams = OrderEmailParams | PasswordResetParams

const resolveTemplate = (params: SendCustomerEmailParams): { subject: string; html: string } => {
  if (params.template === 'passwordReset') {
    return passwordReset({
      resetLink: params.data.resetLink,
      locale: params.data.locale,
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

  try {
    const { subject, html } = resolveTemplate(params)

    await payload.sendEmail({
      to,
      subject,
      html,
    })

    payload.logger.info(`[email] Sent "${params.template}" to ${to}`)
  } catch (err) {
    payload.logger.error(
      `[email] Failed to send "${params.template}" to ${to}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
