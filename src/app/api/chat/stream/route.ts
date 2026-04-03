import { getPayload } from 'payload'
import type { Where } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/chat/stream?conversationId=<id>
 *
 * Server-Sent Events endpoint. Polls for new chat messages and
 * sends them as SSE events. Sends a heartbeat every 15 s.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    return new Response('conversationId is required', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let lastMessageId: number | null = null
      let closed = false

      // Listen for abort (client disconnect)
      request.signal.addEventListener('abort', () => {
        closed = true
        controller.close()
      })

      const send = (event: string, data: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`))
        } catch {
          closed = true
        }
      }

      // Initial connection confirmation
      send('connected', JSON.stringify({ conversationId }))

      const poll = async () => {
        if (closed) return

        try {
          const payload = await getPayload({ config: configPromise })

          const whereConditions: Where[] = [{ conversation: { equals: Number(conversationId) } }]
          if (lastMessageId !== null) {
            whereConditions.push({ id: { greater_than: lastMessageId } })
          }
          const where: Where =
            whereConditions.length === 1 ? whereConditions[0] : { and: whereConditions }

          const { docs } = await payload.find({
            collection: 'chat-messages',
            where,
            sort: 'createdAt',
            limit: 50,
            depth: 0,
          })

          for (const msg of docs) {
            send('message', JSON.stringify(msg))
            if (msg.id > (lastMessageId ?? 0)) {
              lastMessageId = msg.id
            }
          }
        } catch (err) {
          console.error('[chat/stream] Poll error:', err)
        }
      }

      // Initial poll to get existing messages
      await poll()

      // Poll every 1.5 s for new messages
      const pollInterval = setInterval(poll, 1500)

      // Heartbeat every 15 s
      const heartbeatInterval = setInterval(() => {
        send('heartbeat', JSON.stringify({ ts: Date.now() }))
      }, 15000)

      // Cleanup when request is aborted
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval)
        clearInterval(heartbeatInterval)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
