import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import sharp from 'sharp'

// Using the direct v1beta REST endpoint instead of the SDK. The
// `@google/generative-ai@0.24.1` SDK silently drops the `responseModalities`
// config field, which these image models require to return an image part —
// otherwise they respond with an empty content array.
//
// Model choice: `nano-banana-pro-preview` — Google's image editing / VTO
// preview. Stricter `gemini-2.5-flash-image` kept rejecting person-based VTO
// with finishReason=IMAGE_SAFETY. nano-banana-pro handles the same prompts
// cleanly and stays under the Gemini Developer API (no Vertex region pin to
// us-central1 — the brand's main traffic is in Vietnam, so latency to a US
// region would hurt).
const GEMINI_IMAGE_MODEL = 'nano-banana-pro-preview'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`

// Always normalise incoming images to ≤800px JPEG (quality 75). Large originals
// (the brand's N*.png hi-res shots are 20-60MB) cause Gemini to either time out
// or return empty responses. The 800px cap keeps per-image bytes under ~250KB.
async function compressForGemini(buffer: Buffer): Promise<{ buffer: Buffer; mimetype: string }> {
  const compressed = await sharp(buffer)
    .rotate()
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer()
  return { buffer: compressed, mimetype: 'image/jpeg' }
}

/** Strip the `data:image/...;base64,` prefix if present. */
function stripDataUrlPrefix(value: string): string {
  return value.replace(/^data:image\/[^;]+;base64,/, '')
}

/** Validate that a URL is safe to fetch (no SSRF).
 *  `selfOrigin` (when provided) exempts same-origin URLs — those are
 *  intentional fetches of our own Payload media.
 */
function assertUrlSafe(url: string, selfOrigin?: string): void {
  const parsed = new URL(url)

  // Only allow http/https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are allowed')
  }

  if (selfOrigin) {
    const selfUrl = new URL(selfOrigin)
    const hostLower = parsed.hostname.toLowerCase()
    const sameHost = hostLower === selfUrl.hostname.toLowerCase()
    const isLocalhostAlias =
      hostLower === 'localhost' || hostLower === '127.0.0.1' || hostLower === '::1'
    const samePort = (parsed.port || '') === (selfUrl.port || '')
    if (samePort && (sameHost || isLocalhostAlias)) return
  }

  // Block private/internal IP ranges
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

/** Fetch a URL and return its content as a compressed buffer. */
async function urlToCompressed(
  url: string,
  selfOrigin?: string,
): Promise<{ buffer: Buffer; mimetype: string }> {
  assertUrlSafe(url, selfOrigin)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch image URL: ${res.status}`)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  return compressForGemini(buffer)
}

/**
 * Resolve an image value to a base64 string + mime type, compressing large files.
 * Handles absolute URLs (http/https), relative URLs (starting with /),
 * and base64 / data-URL strings.
 */
async function resolveToInlineImage(
  value: string,
  requestUrl: string,
): Promise<{ data: string; mimetype: string }> {
  const selfOrigin = new URL(requestUrl).origin
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const { buffer, mimetype } = await urlToCompressed(value, selfOrigin)
    return { data: buffer.toString('base64'), mimetype }
  }
  if (value.startsWith('/')) {
    const { buffer, mimetype } = await urlToCompressed(`${selfOrigin}${value}`, selfOrigin)
    return { data: buffer.toString('base64'), mimetype }
  }
  // Raw base64 or data URL — decode → compress → re-encode
  const raw = stripDataUrlPrefix(value)
  const { buffer, mimetype } = await compressForGemini(Buffer.from(raw, 'base64'))
  return { data: buffer.toString('base64'), mimetype }
}

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter (per user id)
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

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
  for (const [ip, timestamps] of rateLimitMap) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (valid.length === 0) {
      rateLimitMap.delete(ip)
    } else {
      rateLimitMap.set(ip, valid)
    }
  }
}

export async function POST(request: Request) {
  // --- Auth check ---
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // --- Rate-limit check (keyed by user id from JWT) ---
  const now = Date.now()
  const clientKey = getRateLimitKey(token, 'vto')

  rateLimitRequestCount++
  if (rateLimitRequestCount % 100 === 0 || rateLimitMap.size > 1000) {
    cleanupRateLimitMap(now)
  }

  const timestamps = (rateLimitMap.get(clientKey) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  )

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const oldestInWindow = timestamps[0]
    const retryAfterSeconds = (RATE_LIMIT_WINDOW_MS - (now - oldestInWindow)) / 1000
    return NextResponse.json(
      { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterSeconds)) } },
    )
  }

  timestamps.push(now)
  rateLimitMap.set(clientKey, timestamps)

  // --- Parse body ---
  let body: {
    personImage?: string
    productImage?: string
    productName?: string
    productColor?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { personImage, productImage, productName, productColor } = body

  if (!personImage || !productImage) {
    return NextResponse.json(
      { error: 'personImage and productImage are required' },
      { status: 400 },
    )
  }

  try {
    // Resolve images — handles absolute URLs, relative URLs, and base64/data URLs.
    // Large originals (>1MB) are auto-downscaled to 1024px JPEG to stay under
    // Gemini's payload limit.
    const personImg = await resolveToInlineImage(personImage, request.url)
    const productImg = await resolveToInlineImage(productImage, request.url)

    const productDesc = [productName, productColor].filter(Boolean).join(' — ')
    const prompt =
      `Put the clothing item from the second image onto the person in the first image. ` +
      `Preserve the person's face, pose, body proportions, and background. ` +
      `Match fit and drape realistically.` +
      (productDesc ? ` Product: ${productDesc}.` : '') +
      ` Output only the generated image.`

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 503 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120_000)

    let body: {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string; inlineData?: { mimeType?: string; data?: string } }>
        }
        finishReason?: string
        safetyRatings?: unknown
      }>
      promptFeedback?: unknown
    }
    try {
      const apiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: personImg.mimetype, data: personImg.data } },
                { inlineData: { mimeType: productImg.mimetype, data: productImg.data } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
        signal: controller.signal,
      })
      if (!apiRes.ok) {
        const text = await apiRes.text()
        console.error('Gemini image API error:', apiRes.status, text.slice(0, 500))
        return NextResponse.json({ error: `Gemini API error: ${apiRes.status}` }, { status: 502 })
      }
      body = await apiRes.json()
    } finally {
      clearTimeout(timeout)
    }

    const parts = body.candidates?.[0]?.content?.parts ?? []
    const imgPart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'))

    if (!imgPart?.inlineData?.data) {
      const debug = {
        parts: parts.map((p) =>
          p.inlineData
            ? `[inline ${p.inlineData.mimeType} ${p.inlineData.data?.length || 0}b]`
            : `[text] ${(p.text || '').slice(0, 120)}`,
        ),
        finishReason: body.candidates?.[0]?.finishReason,
        promptFeedback: body.promptFeedback,
      }
      console.error('VTO: no image part returned.', JSON.stringify(debug))
      return NextResponse.json({ error: 'no image returned', debug }, { status: 502 })
    }

    return NextResponse.json({
      image: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(
      '[VTO] /api/vto/generate failed:',
      message,
      err instanceof Error ? err.stack : '',
    )
    if (message.includes('aborted')) {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
    }

    return NextResponse.json(
      {
        error: 'Virtual try-on failed. Please try again later.',
        // Expose the real reason so the client can surface it and we can
        // see it in logs without another deploy loop.
        detail: message,
      },
      { status: 500 },
    )
  }
}
