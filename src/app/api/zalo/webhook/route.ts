import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/zalo/webhook
 * Zalo OA webhook verification endpoint.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const verifyToken = searchParams.get('verify_token')

  if (verifyToken === process.env.ZALO_WEBHOOK_VERIFY_TOKEN) {
    return new Response(verifyToken, { status: 200 })
  }

  return new Response('Forbidden', { status: 403 })
}

/**
 * POST /api/zalo/webhook
 * Handles inbound Zalo OA webhook events:
 *   - user_send_text: user sent a text message
 *   - follow: user followed OA
 *   - unfollow: user unfollowed OA
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const eventName = body.event_name as string
  const sender = body.sender as { id: string } | undefined
  const message = body.message as { text?: string } | undefined

  if (!sender?.id) {
    return Response.json({ ok: true })
  }

  const zaloUserId = sender.id

  try {
    const payload = await getPayload({ config: configPromise })

    if (eventName === 'user_send_text' && message?.text) {
      // Find or create a chat conversation for this Zalo user
      const existing = await payload.find({
        collection: 'chat-conversations',
        where: {
          and: [
            { zaloUserId: { equals: zaloUserId } },
            { status: { not_equals: 'closed' } },
            { channel: { equals: 'zalo' } },
          ],
        },
        limit: 1,
        sort: '-createdAt',
      })

      let convId: number

      if (existing.docs.length > 0) {
        convId = existing.docs[0].id
      } else {
        // Check if user exists in our DB
        const userResult = await payload.find({
          collection: 'users',
          where: { zaloUserId: { equals: zaloUserId } },
          limit: 1,
        })

        const newConv = await payload.create({
          collection: 'chat-conversations',
          data: {
            status: 'active',
            channel: 'zalo',
            zaloUserId,
            startedAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            messageCount: 0,
            ...(userResult.docs.length > 0 ? { user: userResult.docs[0].id } : {}),
          },
        })
        convId = newConv.id
      }

      // Persist the user message
      await payload.create({
        collection: 'chat-messages',
        data: {
          conversation: convId,
          role: 'user',
          content: message.text,
          channel: 'zalo',
        },
      })

      // Update conversation
      const conv = await payload.findByID({ collection: 'chat-conversations', id: convId })
      await payload.update({
        collection: 'chat-conversations',
        id: convId,
        data: {
          lastMessageAt: new Date().toISOString(),
          messageCount: (conv.messageCount ?? 0) + 1,
        },
      })

      // If not in admin_takeover, route to AI
      if (conv.status !== 'admin_takeover') {
        // Fire-and-forget AI response for Zalo
        handleZaloAIResponse({
          payload,
          convId,
          zaloUserId,
          userMessage: message.text,
        }).catch((err) => console.error('[zalo/webhook] AI response error:', err))
      }
    } else if (eventName === 'follow') {
      // User followed OA — update user record if we find them
      await payload.find({
        collection: 'users',
        where: { zaloUserId: { equals: zaloUserId } },
        limit: 1,
      })
      // Could create a welcome message or notification here
    } else if (eventName === 'unfollow') {
      // User unfollowed — could mark conversations as closed
      const openConvs = await payload.find({
        collection: 'chat-conversations',
        where: {
          and: [{ zaloUserId: { equals: zaloUserId } }, { status: { not_equals: 'closed' } }],
        },
      })
      for (const conv of openConvs.docs) {
        await payload.update({
          collection: 'chat-conversations',
          id: conv.id,
          data: { status: 'closed' },
        })
      }
    }
  } catch (err) {
    console.error('[zalo/webhook] Error:', err)
  }

  return Response.json({ ok: true })
}

async function handleZaloAIResponse({
  payload,
  convId,
  zaloUserId,
  userMessage,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  convId: number
  zaloUserId: string
  userMessage: string
}) {
  const { geminiFlash } = await import('@/lib/gemini')

  const systemInstruction =
    'You are a friendly and knowledgeable fashion styling assistant for THE WHITE, a Vietnamese athletic and streetwear brand. ' +
    'Help customers with outfit advice, styling tips, product questions, and size guidance. ' +
    'Be concise, warm, and encouraging. ' +
    'Detect the language of the user message and always respond in the same language. ' +
    'If writing in Vietnamese, use natural, friendly Vietnamese.'

  const chat = geminiFlash.startChat({ systemInstruction })
  const result = await chat.sendMessage(userMessage)
  const responseText = result.response.text()

  if (!responseText) return

  // Persist assistant message
  await payload.create({
    collection: 'chat-messages',
    data: {
      conversation: convId,
      role: 'assistant',
      content: responseText,
      channel: 'zalo',
    },
  })

  // Send via Zalo
  const { zaloSendMessage } = await import('@/lib/zalo')
  await zaloSendMessage({ to: zaloUserId, text: responseText })

  // Update conversation
  const conv = await payload.findByID({ collection: 'chat-conversations', id: convId })
  await payload.update({
    collection: 'chat-conversations',
    id: convId,
    data: {
      lastMessageAt: new Date().toISOString(),
      messageCount: (conv.messageCount ?? 0) + 1,
    },
  })
}
