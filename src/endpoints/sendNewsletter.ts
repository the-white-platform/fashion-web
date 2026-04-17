import type { PayloadHandler } from 'payload'
import type { NewsletterCampaign } from '@/payload-types'
import { hasRole } from '@/access/roles'

/** Minimal Lexical → HTML serializer for plain email delivery. */
function lexicalToHtml(content: NewsletterCampaign['content']): string {
  if (!content?.root?.children?.length) return ''

  const serializeNode = (node: Record<string, unknown>): string => {
    if (node.type === 'text') {
      let text = String(node.text ?? '')
      const format = (node.format as number) ?? 0
      if (format & 1) text = `<strong>${text}</strong>` // IS_BOLD
      if (format & 2) text = `<em>${text}</em>` // IS_ITALIC
      if (format & 8) text = `<span style="text-decoration:underline">${text}</span>` // IS_UNDERLINE
      if (format & 4) text = `<span style="text-decoration:line-through">${text}</span>` // IS_STRIKETHROUGH
      if (format & 16) text = `<code>${text}</code>` // IS_CODE
      return text
    }

    const children = Array.isArray(node.children)
      ? (node.children as Record<string, unknown>[]).map(serializeNode).join('')
      : ''

    switch (node.type) {
      case 'paragraph':
        return `<p>${children}</p>`
      case 'heading':
        return `<${node.tag}>${children}</${node.tag}>`
      case 'list':
        return `<${node.tag}>${children}</${node.tag}>`
      case 'listitem':
        return `<li>${children}</li>`
      case 'quote':
        return `<blockquote>${children}</blockquote>`
      case 'linebreak':
        return '<br>'
      case 'link': {
        const fields = node.fields as Record<string, unknown> | undefined
        const href = fields?.url ?? '#'
        return `<a href="${href}">${children}</a>`
      }
      default:
        return children
    }
  }

  return (content.root.children as Record<string, unknown>[]).map(serializeNode).join('')
}

const BATCH_SIZE = 50

export const sendNewsletterHandler: PayloadHandler = async (req) => {
  const user = req.user

  if (!user || !hasRole(user, ['admin', 'editor'])) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { campaignId?: unknown }
  try {
    body = (await req.json?.()) ?? {}
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const campaignId = Number(body.campaignId)
  if (!Number.isFinite(campaignId)) {
    return Response.json({ error: 'campaignId is required' }, { status: 400 })
  }

  const { payload } = req

  // Fetch campaign
  let campaign: NewsletterCampaign
  try {
    campaign = await payload.findByID({
      collection: 'newsletter-campaigns',
      id: campaignId,
    })
  } catch {
    return Response.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const htmlContent = lexicalToHtml(campaign.content)
  if (!htmlContent) {
    return Response.json({ error: 'Campaign content is empty — cannot send.' }, { status: 400 })
  }

  if (campaign.status !== 'draft') {
    return Response.json(
      { error: `Campaign is not in draft state (current: ${campaign.status})` },
      { status: 400 },
    )
  }

  // Mark as sending
  await payload.update({
    collection: 'newsletter-campaigns',
    id: campaignId,
    data: { status: 'sending' },
  })

  // Fetch all active subscribers
  const { docs: subscribers } = await payload.find({
    collection: 'newsletter-subscribers',
    where: { status: { equals: 'active' } },
    limit: 10000,
    pagination: false,
  })

  let sent = 0
  let failed = 0

  // Send in batches
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE)

    await Promise.allSettled(
      batch.map(async (subscriber) => {
        const email = subscriber.email
        const token = subscriber.unsubscribeToken
        const locale: 'vi' | 'en' =
          (subscriber as { preferredLocale?: 'vi' | 'en' }).preferredLocale === 'en' ? 'en' : 'vi'
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/unsubscribe?token=${token}`

        try {
          const subject = campaign.subject ?? ''

          await payload.sendEmail({
            to: email,
            subject,
            html: buildEmailHtml({
              subject,
              content: htmlContent,
              unsubscribeUrl,
              subscriberName: (subscriber.name as string) ?? '',
              locale,
            }),
          })
          sent++
        } catch (error) {
          payload.logger.error(`[sendNewsletter] Failed to send to ${email}: ${error}`)
          failed++
        }
      }),
    )
  }

  // Update campaign status
  await payload.update({
    collection: 'newsletter-campaigns',
    id: campaignId,
    data: {
      status: failed > 0 && sent === 0 ? 'failed' : 'sent',
      sentAt: new Date().toISOString(),
      recipientCount: sent,
    },
  })

  return Response.json({ sent, failed, total: subscribers.length }, { status: 200 })
}

const NEWSLETTER_COPY = {
  vi: {
    greeting: (name: string) => `Xin chào ${name},`,
    disclaimer: 'Bạn nhận được email này vì đã đăng ký nhận tin từ The White.',
    unsubscribe: 'Hủy đăng ký',
  },
  en: {
    greeting: (name: string) => `Hi ${name},`,
    disclaimer: 'You received this email because you subscribed to updates from The White.',
    unsubscribe: 'Unsubscribe',
  },
} as const

function buildEmailHtml({
  subject,
  content,
  unsubscribeUrl,
  subscriberName,
  locale,
}: {
  subject: string
  content: string
  unsubscribeUrl: string
  subscriberName: string
  locale: 'vi' | 'en'
}): string {
  const copy = NEWSLETTER_COPY[locale] ?? NEWSLETTER_COPY.vi
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <header style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: bold; letter-spacing: 0.1em;">THE WHITE</h1>
  </header>
  ${subscriberName ? `<p>${copy.greeting(subscriberName)}</p>` : ''}
  <div>${content}</div>
  <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
    <p>${copy.disclaimer}</p>
    <p>
      <a href="${unsubscribeUrl}" style="color: #666;">${copy.unsubscribe}</a>
    </p>
  </footer>
</body>
</html>`
}
