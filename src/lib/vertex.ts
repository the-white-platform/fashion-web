import { GoogleAuth } from 'google-auth-library'

/**
 * Vertex AI client wrapper.
 *
 * Auth: uses Application Default Credentials. On Cloud Run that's the
 * service account attached to the revision (already granted
 * `roles/aiplatform.user` via terraform). For local dev, run
 * `gcloud auth application-default login` once. Without ADC the access
 * token call throws — the VTO route catches and falls back to the
 * Gemini Developer API, so absence of GCP creds doesn't break local
 * development.
 */

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
})

let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value
  }
  const client = await auth.getClient()
  const res = await client.getAccessToken()
  if (!res?.token) {
    throw new Error('Vertex: getAccessToken returned no token')
  }
  // google-auth-library refreshes internally; cache for ~50 min as a
  // soft cap so we don't pin a single token across hours.
  cachedToken = { value: res.token, expiresAt: Date.now() + 50 * 60_000 }
  return res.token
}

export interface VertexResult {
  inlineData?: { mimeType: string; data: string }
  finishReason?: string
  raw: unknown
}

interface VertexBody {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { mimeType?: string; data?: string }
        text?: string
      }>
    }
    finishReason?: string
  }>
}

/**
 * Call Vertex AI's gemini-2.5-flash-image model with the same Gemini-style
 * `contents`/`generationConfig` shape used by the Gemini Developer API,
 * so the VTO route can fall back without translating request bodies.
 */
export async function vertexGeminiImage(opts: {
  parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }>
  signal?: AbortSignal
}): Promise<VertexResult> {
  const projectId = process.env.GCP_PROJECT_ID
  if (!projectId) {
    throw new Error('Vertex: GCP_PROJECT_ID is not set')
  }
  const location = process.env.VERTEX_LOCATION || 'us-central1'
  const model = 'gemini-2.5-flash-image'
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`

  const token = await getAccessToken()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: opts.parts }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
    signal: opts.signal,
  })

  if (!res.ok) {
    const text = (await res.text()).slice(0, 500)
    throw new Error(`vertex ${res.status}: ${text}`)
  }

  const body = (await res.json()) as VertexBody
  const parts = body.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'))

  return {
    inlineData:
      imagePart?.inlineData?.data && imagePart.inlineData.mimeType
        ? { mimeType: imagePart.inlineData.mimeType, data: imagePart.inlineData.data }
        : undefined,
    finishReason: body.candidates?.[0]?.finishReason,
    raw: body,
  }
}
