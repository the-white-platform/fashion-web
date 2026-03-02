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
    throw new Error(`Failed to fetch product image URL: ${res.status}`)
  }
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

export async function POST(request: Request) {
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
    // Resolve product image — fetch if it's a URL, otherwise use as-is
    let productBase64: string
    if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
      productBase64 = await urlToBase64(productImage)
    } else {
      productBase64 = stripDataUrlPrefix(productImage)
    }

    const personBase64 = stripDataUrlPrefix(personImage)

    // Get access token via ADC
    const client = await auth.getClient()
    const tokenResponse = await client.getAccessToken()
    const accessToken = tokenResponse?.token
    if (!accessToken) {
      throw new Error('Failed to obtain access token')
    }

    const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/virtual-try-on-preview-08-04:predict`

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
            personImage: { bytesBase64Encoded: personBase64 },
            productImage: { bytesBase64Encoded: productBase64 },
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
      return NextResponse.json(
        { error: 'No image returned from Vertex AI' },
        { status: 502 },
      )
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

