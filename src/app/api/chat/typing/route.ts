export const dynamic = 'force-dynamic'

/**
 * In-memory typing state.
 * key: conversationId → { userId/guestId, name, expiresAt }
 */
interface TypingEntry {
  senderId: string
  name: string
  expiresAt: number
}

const typingState = new Map<string, TypingEntry>()
const TYPING_TTL_MS = 3000

function cleanupTyping(convId: string) {
  const entry = typingState.get(convId)
  if (entry && Date.now() > entry.expiresAt) {
    typingState.delete(convId)
  }
}

/**
 * POST /api/chat/typing
 * Body: { conversationId, senderId, name }
 */
export async function POST(request: Request) {
  try {
    const { conversationId, senderId, name } = await request.json()

    if (!conversationId || !senderId) {
      return Response.json({ error: 'conversationId and senderId are required' }, { status: 400 })
    }

    typingState.set(String(conversationId), {
      senderId: String(senderId),
      name: String(name ?? senderId),
      expiresAt: Date.now() + TYPING_TTL_MS,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}

/**
 * GET /api/chat/typing?conversationId=<id>
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    return Response.json({ error: 'conversationId is required' }, { status: 400 })
  }

  cleanupTyping(conversationId)
  const entry = typingState.get(conversationId)

  return Response.json({ typing: entry ? { senderId: entry.senderId, name: entry.name } : null })
}
