import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { hasRole } from '@/access/roles'
import type { User } from '@/payload-types'

export const dynamic = 'force-dynamic'

/**
 * POST /api/chat/send
 * Admin direct message — bypasses AI, sends message directly to conversation.
 * Body: { conversationId, content }
 * Requires admin/editor/staff role.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || !hasRole(user as User, ['admin', 'editor', 'staff'])) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { conversationId, content } = await request.json()

    if (!conversationId || !content?.trim()) {
      return Response.json({ error: 'conversationId and content are required' }, { status: 400 })
    }

    // Fetch conversation to get channel info
    const conv = await payload.findByID({
      collection: 'chat-conversations',
      id: Number(conversationId),
    })

    // Create admin message
    const message = await payload.create({
      collection: 'chat-messages',
      data: {
        conversation: Number(conversationId),
        role: 'admin',
        content: content.trim(),
        senderName: (user as User).name ?? 'Admin',
        channel: (conv.channel as 'web' | 'zalo') ?? 'web',
      },
    })

    // Update conversation metadata
    await payload.update({
      collection: 'chat-conversations',
      id: Number(conversationId),
      data: {
        lastMessageAt: new Date().toISOString(),
        messageCount: (conv.messageCount ?? 0) + 1,
        status: 'admin_takeover',
        assignedTo: (user as User).id,
      },
    })

    // If Zalo channel, also send via Zalo API
    if (conv.channel === 'zalo' && conv.zaloUserId) {
      try {
        const { sendZaloMessage } = await import('@/utilities/sendZaloMessage')
        await sendZaloMessage({ toUserId: conv.zaloUserId, text: content.trim() })
      } catch (err) {
        console.error('[chat/send] Zalo send error:', err)
      }
    }

    return Response.json({ ok: true, message })
  } catch (err) {
    console.error('[chat/send] Error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
