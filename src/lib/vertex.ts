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

/** Resolve Vertex AI project id + region from env once per call. */
function vertexBaseUrl(model: string): string {
  const projectId = process.env.GCP_PROJECT_ID
  if (!projectId) {
    throw new Error('Vertex: GCP_PROJECT_ID is not set')
  }
  const location = process.env.VERTEX_LOCATION || 'us-central1'
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}`
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
  const url = `${vertexBaseUrl('gemini-2.5-flash-image')}:generateContent`
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

// ---------------------------------------------------------------------------
// Text generation helpers — used by the chat + size-recommend routes so
// all LLM billing lands on the GCP trial credit (Vertex) instead of
// AI Studio's separate Gemini API plan.
// ---------------------------------------------------------------------------

type TextPart = { text: string }
type Part = TextPart | { inlineData: { mimeType: string; data: string } }
type Role = 'user' | 'model'

export interface HistoryMessage {
  role: Role
  parts: Part[]
}

export interface GenerateOptions {
  model?: string
  systemInstruction: string
  history?: HistoryMessage[]
  userMessage: string | Part[]
  generationConfig?: Record<string, unknown>
  signal?: AbortSignal
}

function buildContents(opts: GenerateOptions): HistoryMessage[] {
  const userParts: Part[] =
    typeof opts.userMessage === 'string' ? [{ text: opts.userMessage }] : opts.userMessage
  return [...(opts.history ?? []), { role: 'user', parts: userParts }]
}

function buildBody(opts: GenerateOptions): string {
  return JSON.stringify({
    systemInstruction: { role: 'system', parts: [{ text: opts.systemInstruction }] },
    contents: buildContents(opts),
    ...(opts.generationConfig ? { generationConfig: opts.generationConfig } : {}),
  })
}

/**
 * Non-streaming text generation. Returns the full response text (useful
 * for JSON-mode requests like /api/ai/size-recommend).
 */
export async function vertexGeminiGenerate(opts: GenerateOptions): Promise<{
  text: string
  finishReason?: string
  raw: unknown
}> {
  const model = opts.model || 'gemini-2.5-flash'
  const url = `${vertexBaseUrl(model)}:generateContent`
  const token = await getAccessToken()

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: buildBody(opts),
    signal: opts.signal,
  })

  if (!res.ok) {
    const text = (await res.text()).slice(0, 500)
    throw new Error(`vertex ${res.status}: ${text}`)
  }

  const body = (await res.json()) as VertexBody
  const parts = body.candidates?.[0]?.content?.parts ?? []
  const text = parts.map((p) => p.text ?? '').join('')
  return { text, finishReason: body.candidates?.[0]?.finishReason, raw: body }
}

/**
 * Streaming text generation — returns an async iterable of text chunks.
 * Uses Vertex's `streamGenerateContent?alt=sse` endpoint which emits
 * `data: {...}` SSE frames identical in shape to a regular
 * generateContent response but chunked.
 */
export async function* vertexGeminiStream(
  opts: GenerateOptions,
): AsyncGenerator<string, void, unknown> {
  const model = opts.model || 'gemini-2.5-flash'
  const url = `${vertexBaseUrl(model)}:streamGenerateContent?alt=sse`
  const token = await getAccessToken()

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: buildBody(opts),
    signal: opts.signal,
  })

  if (!res.ok) {
    const text = (await res.text()).slice(0, 500)
    throw new Error(`vertex ${res.status}: ${text}`)
  }
  if (!res.body) throw new Error('vertex: empty response body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  const emitFrame = function* (frame: string): Generator<string> {
    for (const line of frame.split(/\r?\n/)) {
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const parsed = JSON.parse(payload) as VertexBody
        const parts = parsed.candidates?.[0]?.content?.parts ?? []
        for (const p of parts) if (p.text) yield p.text
      } catch {
        // Skip malformed frames; Vertex occasionally sends heartbeats.
      }
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })

    // SSE frames are separated by blank line (\n\n or \r\n\r\n). Flush
    // every complete frame; keep any trailing partial frame in `buf`.
    const matches = buf.split(/\r?\n\r?\n/)
    buf = matches.pop() ?? ''
    for (const frame of matches) {
      yield* emitFrame(frame)
    }
  }

  // Flush any leftover complete-looking frame the server terminated
  // without a trailing blank line.
  if (buf.trim()) {
    yield* emitFrame(buf)
  }
}
