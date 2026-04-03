import type { PayloadHandler } from 'payload'
import type { NewsletterCampaign } from '@/payload-types'
import { hasRole } from '@/access/roles'

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
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/vi/unsubscribe?token=${token}`

        try {
          const subject = campaign.subject ?? ''

          await payload.sendEmail({
            to: email,
            subject,
            html: buildEmailHtml({
              subject,
              content: '<!-- campaign content -->',
              unsubscribeUrl,
              subscriberName: (subscriber.name as string) ?? '',
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

function buildEmailHtml({
  subject,
  content,
  unsubscribeUrl,
  subscriberName,
}: {
  subject: string
  content: string
  unsubscribeUrl: string
  subscriberName: string
}): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <header style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: bold; letter-spacing: 0.1em;">THE WHITE</h1>
  </header>
  ${subscriberName ? `<p>Xin chào ${subscriberName},</p>` : ''}
  <div>${content}</div>
  <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
    <p>Bạn nhận được email này vì đã đăng ký nhận tin từ The White.</p>
    <p>
      <a href="${unsubscribeUrl}" style="color: #666;">Hủy đăng ký</a>
    </p>
  </footer>
</body>
</html>`
}
