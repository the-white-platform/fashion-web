import { cookies } from 'next/headers'
import { geminiFlash } from '@/lib/gemini'

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter (per user token prefix)
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

/** token-key → list of request timestamps (ms) within the current window. */
const rateLimitMap = new Map<string, number[]>()
let rateLimitRequestCount = 0

function getRateLimitKey(token: string): string {
  return `chat_${token.slice(0, 16)}`
}

/** Remove stale entries to prevent unbounded memory growth. */
function cleanupRateLimitMap(now: number) {
  for (const [key, timestamps] of rateLimitMap) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (valid.length === 0) {
      rateLimitMap.delete(key)
    } else {
      rateLimitMap.set(key, valid)
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

interface ProductContext {
  name: string
  category: string
  price: string
}

interface RequestBody {
  messages: ChatMessage[]
  productContext?: ProductContext
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  // --- Auth check ---
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // --- Rate-limit check ---
  const now = Date.now()
  const clientKey = getRateLimitKey(token)

  rateLimitRequestCount++
  if (rateLimitRequestCount % 100 === 0 || rateLimitMap.size > 1000) {
    cleanupRateLimitMap(now)
  }

  const timestamps = (rateLimitMap.get(clientKey) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  )

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const oldestInWindow = timestamps[0]
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestInWindow)) / 1000)
    return new Response(
      JSON.stringify({ error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
        },
      },
    )
  }

  timestamps.push(now)
  rateLimitMap.set(clientKey, timestamps)

  // --- Parse body ---
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, productContext } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // --- Build system instruction ---
  let systemInstruction =
    'You are a friendly and knowledgeable fashion styling assistant for THE WHITE, a Vietnamese athletic and streetwear brand. ' +
    'Help customers with outfit advice, styling tips, product questions, and size guidance. ' +
    'Be concise, warm, and encouraging. ' +
    'Detect the language of the user message and always respond in the same language. ' +
    'If writing in Vietnamese, use natural, friendly Vietnamese.'

  if (productContext) {
    systemInstruction +=
      `\n\nThe customer is currently viewing this product:\n` +
      `- Name: ${productContext.name}\n` +
      `- Category: ${productContext.category}\n` +
      `- Price: ${productContext.price}\n` +
      `Use this context to give relevant, specific styling advice about this item.`
  }

  // --- Stream response ---
  try {
    const model = geminiFlash

    // Build history (all messages except the last user message)
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }))

    const lastMessage = messages[messages.length - 1]

    const chat = model.startChat({
      history,
      systemInstruction,
    })

    const result = await chat.sendMessageStream(lastMessage.content)

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('Gemini chat error:', err)
    return new Response(
      JSON.stringify({ error: 'Trợ lý AI tạm thời không khả dụng. Vui lòng thử lại sau.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
