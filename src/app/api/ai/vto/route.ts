import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { geminiFlash } from '@/lib/gemini'
import type { Part } from '@google/generative-ai'

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter (per user id)
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

/** token-key → list of request timestamps (ms) within the current window. */
const rateLimitMap = new Map<string, number[]>()
let rateLimitRequestCount = 0

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'))
    return payload?.id != null ? String(payload.id) : null
  } catch {
    return null
  }
}

function getRateLimitKey(token: string, scope: string): string {
  const userId = getUserIdFromToken(token)
  if (userId) return `${scope}_user_${userId}`
  return `${scope}_tok_${createHash('sha256').update(token).digest('hex').slice(0, 16)}`
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
// Helpers
// ---------------------------------------------------------------------------

/** Strip the `data:image/...;base64,` prefix and return mime type + raw base64. */
function parseDataUrl(value: string): { mimeType: string; data: string } | null {
  const match = value.match(/^data:(image\/[^;]+);base64,(.+)$/)
  if (match) {
    return { mimeType: match[1], data: match[2] }
  }
  return null
}

/** Validate that a URL is safe to fetch (no SSRF).
 *  `selfOrigin` (when provided) exempts URLs pointing at our own app origin —
 *  those are intentional relative-media fetches resolved via the request URL.
 */
function assertUrlSafe(url: string, selfOrigin?: string): void {
  const parsed = new URL(url)

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are allowed')
  }

  // Same-origin fetch: trust the app serving the request (Payload media).
  // In dev the request may arrive via `thewhite.local:3200` while the browser
  // references `localhost:3200`, so also treat any URL whose port matches the
  // request port AND hostname is a local alias (localhost/127.*/the-request-host)
  // as self-origin.
  if (selfOrigin) {
    const selfUrl = new URL(selfOrigin)
    const hostLower = parsed.hostname.toLowerCase()
    const sameHost = hostLower === selfUrl.hostname.toLowerCase()
    const isLocalhostAlias =
      hostLower === 'localhost' || hostLower === '127.0.0.1' || hostLower === '::1'
    const samePort = (parsed.port || '') === (selfUrl.port || '')
    if (samePort && (sameHost || isLocalhostAlias)) return
  }

  const hostname = parsed.hostname.toLowerCase()
  if (
    hostname === 'localhost' ||
    hostname === '::1' ||
    hostname.endsWith('.internal') ||
    /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.|0\.)/.test(hostname) ||
    hostname === 'metadata.google.internal'
  ) {
    throw new Error('Internal addresses are not allowed')
  }
}

/** Fetch a URL and return its content as base64 with mime type. */
async function urlToInlineData(
  url: string,
  selfOrigin?: string,
): Promise<{ mimeType: string; data: string }> {
  assertUrlSafe(url, selfOrigin)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch image URL: ${res.status}`)
  }
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const mimeType = contentType.split(';')[0].trim()
  const buffer = await res.arrayBuffer()
  return {
    mimeType,
    data: Buffer.from(buffer).toString('base64'),
  }
}

/**
 * Resolve an image value to an inline data part for Gemini.
 * Handles absolute URLs (http/https), relative URLs (starting with /),
 * data URLs, and raw base64 strings.
 */
async function resolveToInlineData(
  value: string,
  requestUrl: string,
): Promise<{ mimeType: string; data: string }> {
  const parsed = parseDataUrl(value)
  if (parsed) {
    return parsed
  }

  const selfOrigin = new URL(requestUrl).origin
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return urlToInlineData(value, selfOrigin)
  }

  if (value.startsWith('/')) {
    return urlToInlineData(`${selfOrigin}${value}`, selfOrigin)
  }

  return { mimeType: 'image/jpeg', data: value }
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(opts: {
  locale: 'vi' | 'en'
  productName?: string
  productColor?: string
  productFeatures?: string[]
}): string {
  const { locale, productName, productColor, productFeatures } = opts

  const nameDesc = [productName, productColor].filter(Boolean).join(' màu ')
  const featuresText =
    productFeatures && productFeatures.length > 0 ? productFeatures.join(', ') : null

  if (locale === 'vi') {
    let prompt =
      `Bạn là chuyên gia tư vấn thời trang của TheWhite — thương hiệu thời trang Việt Nam hiện đại và tối giản. ` +
      `Hãy phân tích ảnh người dùng và sản phẩm được cung cấp, sau đó đưa ra lời khuyên phong cách ngắn gọn, ấm áp bằng tiếng Việt trong 4-6 câu.`
    if (nameDesc) {
      prompt += ` Sản phẩm: ${nameDesc}.`
    }
    if (featuresText) {
      prompt += ` Điểm nổi bật: ${featuresText}.`
    }
    prompt += ` Cuối cùng, gợi ý 1-2 cách phối đồ phù hợp với sản phẩm này.`
    return prompt
  }

  // English
  let prompt =
    `You are a fashion advisor for TheWhite — a modern, minimalist Vietnamese fashion brand. ` +
    `Analyse the user's photo and the provided product image, then give short, warm styling advice in English in 4-6 sentences.`
  if (nameDesc) {
    prompt += ` Product: ${nameDesc}.`
  }
  if (featuresText) {
    prompt += ` Key features: ${featuresText}.`
  }
  prompt += ` End with 1-2 outfit-pairing suggestions that suit this item.`
  return prompt
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  // --- Auth check ---
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  // --- Rate-limit check ---
  const now = Date.now()
  const clientKey = getRateLimitKey(token, 'gemini_vto')

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
    return Response.json(
      { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    )
  }

  timestamps.push(now)
  rateLimitMap.set(clientKey, timestamps)

  // --- Parse body ---
  let body: {
    personImage?: string
    productImages?: string[]
    locale?: 'vi' | 'en'
    productName?: string
    productColor?: string
    productFeatures?: string[]
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    personImage,
    productImages,
    locale = 'vi',
    productName,
    productColor,
    productFeatures,
  } = body

  if (!personImage) {
    return Response.json({ error: 'personImage is required' }, { status: 400 })
  }

  if (!productImages || !Array.isArray(productImages) || productImages.length === 0) {
    return Response.json({ error: 'productImages array is required' }, { status: 400 })
  }

  // --- Build Gemini parts ---
  try {
    const parts: Part[] = []

    // First image: person
    const personData = await resolveToInlineData(personImage, request.url)
    parts.push({ inlineData: personData })

    // Subsequent images: product(s)
    for (const productImage of productImages) {
      const productData = await resolveToInlineData(productImage, request.url)
      parts.push({ inlineData: productData })
    }

    // Localized text prompt
    parts.push({
      text: buildPrompt({
        locale: locale === 'en' ? 'en' : 'vi',
        productName,
        productColor,
        productFeatures,
      }),
    })

    const result = await geminiFlash.generateContent(parts)
    const description = result.response.text()

    return Response.json({ description })
  } catch (err) {
    console.error('Gemini VTO error:', err)
    return Response.json(
      { error: 'Virtual try-on description failed. Please try again later.' },
      { status: 500 },
    )
  }
}
