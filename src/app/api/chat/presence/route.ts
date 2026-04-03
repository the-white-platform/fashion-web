export const dynamic = 'force-dynamic'

/**
 * In-memory admin presence state.
 * key: conversationId → Set of { adminId, name, expiresAt }
 */
interface PresenceEntry {
  adminId: string
  name: string
  expiresAt: number
}

const presenceState = new Map<string, PresenceEntry[]>()
const PRESENCE_TTL_MS = 30000

function cleanupPresence(convId: string) {
  const entries = presenceState.get(convId)
  if (!entries) return
  const now = Date.now()
  const valid = entries.filter((e) => e.expiresAt > now)
  if (valid.length === 0) {
    presenceState.delete(convId)
  } else {
    presenceState.set(convId, valid)
  }
}

/**
 * POST /api/chat/presence
 * Body: { conversationId, adminId, name }
 * Updates admin presence heartbeat (30s TTL).
 */
export async function POST(request: Request) {
  try {
    const { conversationId, adminId, name } = await request.json()

    if (!conversationId || !adminId) {
      return Response.json({ error: 'conversationId and adminId are required' }, { status: 400 })
    }

    cleanupPresence(String(conversationId))

    const entries = presenceState.get(String(conversationId)) ?? []
    const existing = entries.findIndex((e) => e.adminId === String(adminId))
    const entry: PresenceEntry = {
      adminId: String(adminId),
      name: String(name ?? adminId),
      expiresAt: Date.now() + PRESENCE_TTL_MS,
    }

    if (existing >= 0) {
      entries[existing] = entry
    } else {
      entries.push(entry)
    }

    presenceState.set(String(conversationId), entries)

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}

/**
 * GET /api/chat/presence?conversationId=<id>
 * Returns current admin presence for a conversation.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    return Response.json({ error: 'conversationId is required' }, { status: 400 })
  }

  cleanupPresence(conversationId)
  const entries = presenceState.get(conversationId) ?? []

  return Response.json({
    admins: entries.map(({ adminId, name }) => ({ adminId, name })),
  })
}
