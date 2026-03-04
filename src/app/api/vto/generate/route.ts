import { NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
})

/** Strip the `data:image/...;base64,` prefix if present. */
function stripDataUrlPrefix(value: string): string {
  return value.replace(/^data:image\/[^;]+;base64,/, '')
}

/** Fetch a URL and return its content as base64. */
async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch image URL: ${res.status}`)
  }
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

/**
 * Resolve an image value to base64.
 * Handles absolute URLs (http/https), relative URLs (starting with /),
 * and base64 / data-URL strings.
 */
async function resolveToBase64(value: string, requestUrl: string): Promise<string> {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return urlToBase64(value)
  }
  if (value.startsWith('/')) {
    const origin = new URL(requestUrl).origin
    return urlToBase64(`${origin}${value}`)
  }
  return stripDataUrlPrefix(value)
}

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter (per IP)
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

/** IP → list of request timestamps (ms) within the current window. */
const rateLimitMap = new Map<string, number[]>()
let rateLimitRequestCount = 0

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
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
  // --- Rate-limit check (before anything else) ---
  const now = Date.now()
  const clientIp = getClientIp(request)

  rateLimitRequestCount++
  if (rateLimitRequestCount % 100 === 0 || rateLimitMap.size > 1000) {
    cleanupRateLimitMap(now)
  }

  const timestamps = (rateLimitMap.get(clientIp) ?? []).filter(
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
  rateLimitMap.set(clientIp, timestamps)

  // --- Original handler logic ---
  const projectId = process.env.GCP_PROJECT_ID
  const region = process.env.GCP_REGION

  if (!projectId || !region) {
    return NextResponse.json(
      { error: 'GCP environment variables are not configured' },
      { status: 503 },
    )
  }

  let body: { personImage?: string; productImage?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { personImage, productImage } = body

  if (!personImage || !productImage) {
    return NextResponse.json(
      { error: 'personImage and productImage are required' },
      { status: 400 },
    )
  }

  try {
    // Resolve images — handles absolute URLs, relative URLs, and base64/data URLs
    const productBase64 = await resolveToBase64(productImage, request.url)
    const personBase64 = await resolveToBase64(personImage, request.url)

    // Get access token via ADC
    const client = await auth.getClient()
    const tokenResponse = await client.getAccessToken()
    const accessToken = tokenResponse?.token
    if (!accessToken) {
      throw new Error('Failed to obtain access token')
    }

    const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/virtual-try-on-001:predict`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120_000)

    const vertexResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            personImage: {
              image: { bytesBase64Encoded: personBase64 },
            },
            productImages: [
              {
                image: { bytesBase64Encoded: productBase64 },
              },
            ],
          },
        ],
        parameters: { sampleCount: 1 },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!vertexResponse.ok) {
      const errorText = await vertexResponse.text()
      console.error('Vertex AI VTO error:', vertexResponse.status, errorText)
      return NextResponse.json(
        { error: `Vertex AI error: ${vertexResponse.status}` },
        { status: 502 },
      )
    }

    const result = await vertexResponse.json()
    const generatedImage = result?.predictions?.[0]?.bytesBase64Encoded

    if (!generatedImage) {
      return NextResponse.json({ error: 'No image returned from Vertex AI' }, { status: 502 })
    }

    return NextResponse.json({ image: `data:image/png;base64,${generatedImage}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('VTO generate error:', message)

    if (message.includes('aborted')) {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
