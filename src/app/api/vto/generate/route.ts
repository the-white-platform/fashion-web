import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import sharp from 'sharp'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

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
/**
 * Rewrite a same-origin Payload media URL to its public GCS equivalent
 * when PAYLOAD_MEDIA_BUCKET is set. Cloud Run → same-origin HTTPS fetches
 * are flaky (fetch fails outright with "fetch failed") — resolving to
 * storage.googleapis.com avoids the self-call entirely.
 */
function maybeRewriteToGcs(pathOrUrl: string): string | null {
  const bucket = process.env.PAYLOAD_MEDIA_BUCKET
  if (!bucket) return null
  // Accept `/api/media/file/NAME`, `/media/NAME`, or an absolute same-origin
  // URL that contains those prefixes.
  const match = pathOrUrl.match(/\/(?:api\/media\/file|media)\/([^?#]+)/)
  if (!match) return null
  return `https://storage.googleapis.com/${bucket}/${match[1]}`
}

async function resolveToInlineImage(
  value: string,
  requestUrl: string,
): Promise<{ data: string; mimetype: string }> {
  const selfOrigin = new URL(requestUrl).origin

  // Short-circuit: if this looks like one of OUR Payload media URLs and we
  // have a GCS bucket configured, fetch from the public GCS URL directly.
  // The bucket objects are already public-read, and this is significantly
  // more reliable than bouncing back through the Cloud Run service itself.
  const gcsUrl = maybeRewriteToGcs(value)
  if (gcsUrl) {
    const { buffer, mimetype } = await urlToCompressed(gcsUrl, selfOrigin)
    return { data: buffer.toString('base64'), mimetype }
  }

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
// DB-backed per-user daily quota (survives cold starts + multiple Cloud Run
// instances; the previous in-memory sliding window reset whenever an
// instance recycled, which gave premium users effectively unlimited tries).
// ---------------------------------------------------------------------------
const VTO_DAILY_QUOTA = 5
const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** Stable cache key for one VTO request — same inputs ⇒ same hash. */
function inputHashFor(parts: {
  personImage: string
  productImage: string
  productName?: string
  productColor?: string
}): string {
  const h = createHash('sha256')
  h.update(parts.personImage)
  h.update('|')
  h.update(parts.productImage)
  h.update('|')
  h.update(parts.productName || '')
  h.update('|')
  h.update(parts.productColor || '')
  return h.digest('hex')
}

// ---------------------------------------------------------------------------
// Provider chain — try Vertex first (covered by GCP credit), fall back to
// the Gemini Developer API. Both speak the same request shape, so the
// callable only differs in URL + auth header.
// ---------------------------------------------------------------------------
type Provider = 'vertex' | 'gemini'
// Default is vertex-only so all billing lands on the GCP trial credit
// instead of AI Studio's separate Gemini API plan. Set
// VTO_PROVIDER_ORDER=vertex,gemini on Cloud Run to re-enable the
// Gemini Dev API fallback (useful if Vertex safety filters start
// rejecting real person uploads).
const DEFAULT_ORDER: Provider[] = ['vertex']

function providerOrder(): Provider[] {
  const env = (process.env.VTO_PROVIDER_ORDER || '').toLowerCase().trim()
  if (!env) return DEFAULT_ORDER
  const parsed = env
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is Provider => s === 'vertex' || s === 'gemini')
  return parsed.length ? parsed : DEFAULT_ORDER
}

interface ImageReply {
  mimeType: string
  data: string
}

type GeminiPart = { inlineData: { mimeType: string; data: string } } | { text: string }

async function callVertex(parts: GeminiPart[], signal: AbortSignal): Promise<ImageReply | null> {
  // Lazy-import so a missing google-auth-library install (or local dev
  // without ADC) doesn't blow up route module evaluation.
  try {
    const { vertexGeminiImage } = await import('@/lib/vertex')
    const r = await vertexGeminiImage({ parts, signal })
    if (!r.inlineData) {
      console.warn('[VTO] vertex: no image part, finishReason=', r.finishReason)
      return null
    }
    return r.inlineData
  } catch (err) {
    console.warn('[VTO] vertex failed:', err instanceof Error ? err.message : err)
    return null
  }
}

async function callGeminiDev(parts: GeminiPart[], signal: AbortSignal): Promise<ImageReply | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('[VTO] gemini dev: GEMINI_API_KEY not configured')
    return null
  }
  try {
    const apiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
      signal,
    })
    if (!apiRes.ok) {
      const text = await apiRes.text()
      console.warn('[VTO] gemini dev API error:', apiRes.status, text.slice(0, 200))
      return null
    }
    const body = (await apiRes.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> }
        finishReason?: string
      }>
    }
    const part = body.candidates?.[0]?.content?.parts?.find((p) =>
      p.inlineData?.mimeType?.startsWith('image/'),
    )
    if (!part?.inlineData?.data || !part.inlineData.mimeType) {
      console.warn(
        '[VTO] gemini dev: no image part, finishReason=',
        body.candidates?.[0]?.finishReason,
      )
      return null
    }
    return { mimeType: part.inlineData.mimeType, data: part.inlineData.data }
  } catch (err) {
    console.warn('[VTO] gemini dev failed:', err instanceof Error ? err.message : err)
    return null
  }
}

export async function POST(request: Request) {
  // --- Auth check ---
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Resolve the authenticated user via Payload's auth helper instead of
  // hand-decoding the JWT (the route used to peek at the JWT claims to
  // build a rate-limit key, but for a DB-backed quota we need the real
  // user id and to be sure the session is valid).
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  const userId = user.id

  // --- Parse body (needed before cache lookup so we can hash it) ---
  let body: {
    personImage?: string
    productImage?: string
    productName?: string
    productColor?: string
    productId?: number | string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { personImage, productImage, productName, productColor, productId } = body

  // --- Daily quota count (used by both cache + miss paths) ---
  const since = new Date(Date.now() - ONE_DAY_MS).toISOString()
  const { totalDocs: usedToday } = await payload.count({
    collection: 'vto-generations',
    where: {
      and: [{ user: { equals: userId } }, { createdAt: { greater_than: since } }],
    },
  })

  // --- Cache: same user re-running with the exact same inputs gets the
  // previous result back without a Gemini call or a quota hit. Most of
  // the cost in practice comes from users retrying the same upload —
  // this turns those into free repeats. ---
  if (personImage && productImage) {
    const hash = inputHashFor({ personImage, productImage, productName, productColor })
    const prior = await payload.find({
      collection: 'vto-generations',
      depth: 0,
      limit: 1,
      sort: '-createdAt',
      where: {
        and: [{ user: { equals: userId } }, { inputHash: { equals: hash } }],
      },
    })
    const cached = prior.docs[0] as { resultData?: string } | undefined
    if (cached?.resultData) {
      return NextResponse.json({
        image: cached.resultData,
        cached: true,
        quotaUsed: usedToday,
        quotaLimit: VTO_DAILY_QUOTA,
      })
    }
  }

  if (usedToday >= VTO_DAILY_QUOTA) {
    return NextResponse.json(
      {
        error: `Bạn đã dùng hết ${VTO_DAILY_QUOTA} lượt thử đồ ảo trong ngày. Vui lòng quay lại vào ngày mai.`,
        used: usedToday,
        limit: VTO_DAILY_QUOTA,
      },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(ONE_DAY_MS / 1000)) } },
    )
  }

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

    const requestParts: GeminiPart[] = [
      { inlineData: { mimeType: personImg.mimetype, data: personImg.data } },
      { inlineData: { mimeType: productImg.mimetype, data: productImg.data } },
      { text: prompt },
    ]

    // Try each provider in order. Both speak the same Gemini-style
    // request shape, so this is a simple loop — first one that returns
    // an image wins. The Vertex path is preferred when the GCP credit
    // applies; the Gemini Dev API stays as a known-good fallback for
    // Vertex's stricter safety filter.
    const order = providerOrder()
    let imageReply: ImageReply | null = null
    let usedProvider: Provider | null = null
    const tried: Provider[] = []

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120_000)
    try {
      for (const p of order) {
        tried.push(p)
        const reply =
          p === 'vertex'
            ? await callVertex(requestParts, controller.signal)
            : await callGeminiDev(requestParts, controller.signal)
        if (reply) {
          imageReply = reply
          usedProvider = p
          break
        }
      }
    } finally {
      clearTimeout(timeout)
    }

    if (!imageReply || !usedProvider) {
      console.error('[VTO] all providers failed', tried)
      return NextResponse.json(
        { error: 'Virtual try-on is unavailable right now. Please try again later.', tried },
        { status: 502 },
      )
    }

    console.log(`[VTO] served by ${usedProvider} (tried: ${tried.join(',')})`)

    const resultDataUrl = `data:${imageReply.mimeType};base64,${imageReply.data}`

    // Log this successful generation so the daily-quota counter
    // reflects it on the next request, and so a re-try with the same
    // inputs hits the cache. Failures are non-fatal — we'd rather
    // under-count than block the response.
    try {
      const hash =
        personImage && productImage
          ? inputHashFor({ personImage, productImage, productName, productColor })
          : undefined
      await payload.create({
        collection: 'vto-generations',
        data: {
          user: userId,
          ...(productId != null ? { product: Number(productId) } : {}),
          ...(hash ? { inputHash: hash } : {}),
          resultData: resultDataUrl,
          provider: usedProvider,
        },
      })
    } catch (logErr) {
      const detail =
        logErr && typeof logErr === 'object' && 'data' in logErr
          ? JSON.stringify(
              (logErr as { data: unknown }).data,
              (_k, v) => (typeof v === 'string' && v.length > 80 ? `${v.slice(0, 80)}…` : v),
              2,
            )
          : String(logErr)
      console.warn('[VTO] failed to log generation:', detail)
    }

    return NextResponse.json({
      image: resultDataUrl,
      provider: usedProvider,
      quotaUsed: usedToday + 1,
      quotaLimit: VTO_DAILY_QUOTA,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[VTO] /api/vto/generate failed:', message, err instanceof Error ? err.stack : '')
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
