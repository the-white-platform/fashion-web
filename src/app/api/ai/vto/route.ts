import { cookies } from 'next/headers'
import { geminiFlash } from '@/lib/gemini'
import type { Part } from '@google/generative-ai'

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter (per user token prefix)
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

/** token-key → list of request timestamps (ms) within the current window. */
const rateLimitMap = new Map<string, number[]>()
let rateLimitRequestCount = 0

function getRateLimitKey(token: string): string {
  return `gemini_vto_${token.slice(0, 16)}`
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

/** Validate that a URL is safe to fetch (no SSRF). */
function assertUrlSafe(url: string): void {
  const parsed = new URL(url)

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are allowed')
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
async function urlToInlineData(url: string): Promise<{ mimeType: string; data: string }> {
  assertUrlSafe(url)
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
  // Data URL (e.g. data:image/png;base64,...)
  const parsed = parseDataUrl(value)
  if (parsed) {
    return parsed
  }

  // Absolute URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return urlToInlineData(value)
  }

  // Relative URL (e.g. /uploads/product.jpg)
  if (value.startsWith('/')) {
    const origin = new URL(requestUrl).origin
    return urlToInlineData(`${origin}${value}`)
  }

  // Treat as raw base64
  return { mimeType: 'image/jpeg', data: value }
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
    return Response.json(
      { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    )
  }

  timestamps.push(now)
  rateLimitMap.set(clientKey, timestamps)

  // --- Parse body ---
  let body: { personImage?: string; productImages?: string[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { personImage, productImages } = body

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

    // Text prompt
    parts.push({
      text:
        'You are a virtual try-on AI. Analyze the person in the first image and the clothing item(s) in the subsequent images. ' +
        'Describe in detail how the person would look wearing these items, including fit, style, and color coordination. ' +
        'Be specific and visual in your description.',
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
