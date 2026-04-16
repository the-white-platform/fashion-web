import { NextResponse } from 'next/server'
import { vertexGeminiGenerate } from '@/lib/vertex'
import { getChatContextPack } from '@/utilities/getChatContextPack'

/**
 * POST /api/ai/size-recommend
 *
 * Body: { gender: 'men'|'women', productType: 'shirt'|'pants',
 *         heightCm: number, weightKg: number,
 *         chestCm?: number, waistCm?: number,
 *         locale?: 'vi'|'en' }
 *
 * Uses Gemini 2.5 Flash in JSON-response mode, grounded with the same
 * context pack the chatbot reads, to return:
 *
 *   { recommendedSize: 'XS'|'S'|'M'|'L'|'XL'|'2XL',
 *     confidence: number (0-100),
 *     reasoning: string (1-2 sentences, in the requested locale) }
 *
 * Public — no auth required. Rate-limited by Cloud Run's own concurrency
 * limits; add per-IP limiting here if spam becomes a problem.
 */
interface RequestBody {
  gender?: 'men' | 'women'
  productType?: 'shirt' | 'pants'
  heightCm?: number
  weightKg?: number
  chestCm?: number
  waistCm?: number
  locale?: 'vi' | 'en'
}

interface Reply {
  recommendedSize: string
  confidence: number
  reasoning: string
}

export async function POST(request: Request) {
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const gender = body.gender === 'women' ? 'women' : 'men'
  const productType = body.productType === 'pants' ? 'pants' : 'shirt'
  const heightCm = Number(body.heightCm)
  const weightKg = Number(body.weightKg)
  const chestCm = Number.isFinite(Number(body.chestCm)) ? Number(body.chestCm) : null
  const waistCm = Number.isFinite(Number(body.waistCm)) ? Number(body.waistCm) : null
  const locale: 'vi' | 'en' = body.locale === 'en' ? 'en' : 'vi'

  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 220) {
    return NextResponse.json({ error: 'heightCm must be between 100 and 220' }, { status: 400 })
  }
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 200) {
    return NextResponse.json({ error: 'weightKg must be between 30 and 200' }, { status: 400 })
  }

  const contextPack = await getChatContextPack(locale).catch(() => '')

  const systemInstruction =
    'You are a sizing assistant for THE WHITE, a Vietnamese athletic / streetwear brand. ' +
    "Given a customer's body measurements and the brand size guide below, recommend the single best size. " +
    'Respond in JSON ONLY with keys: recommendedSize (one of XS/S/M/L/XL/2XL), confidence (integer 0-100), reasoning (one or two short sentences in ' +
    (locale === 'vi' ? 'Vietnamese' : 'English') +
    '). Confidence reflects how well the measurements match the recommended size range — 95+ means exact match, 60 means a stretch but reasonable, under 50 means the customer is outside the available range. Use the brand size guide in the context, not general fashion heuristics.\n\n' +
    contextPack

  const userMessage = [
    `Gender: ${gender}`,
    `Product: ${productType === 'shirt' ? 'top / shirt' : 'pants / shorts'}`,
    `Height: ${heightCm} cm`,
    `Weight: ${weightKg} kg`,
    chestCm != null ? `Chest: ${chestCm} cm` : null,
    waistCm != null ? `Waist: ${waistCm} cm` : null,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const { text } = await vertexGeminiGenerate({
      systemInstruction,
      userMessage,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            recommendedSize: { type: 'STRING', enum: ['XS', 'S', 'M', 'L', 'XL', '2XL'] },
            confidence: { type: 'INTEGER' },
            reasoning: { type: 'STRING' },
          },
          required: ['recommendedSize', 'confidence', 'reasoning'],
        },
      },
    })

    let parsed: Reply
    try {
      parsed = JSON.parse(text) as Reply
    } catch {
      console.error('[size-recommend] non-JSON reply from Vertex:', text.slice(0, 300))
      return NextResponse.json({ error: 'Model returned non-JSON output' }, { status: 502 })
    }

    // Clamp confidence into [0, 100] in case the model ignored the schema.
    const confidence = Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0)))

    return NextResponse.json({
      recommendedSize: parsed.recommendedSize,
      confidence,
      reasoning: parsed.reasoning,
    })
  } catch (err) {
    console.error('[size-recommend] Vertex error:', err)
    return NextResponse.json(
      { error: 'Size recommendation is unavailable right now.' },
      { status: 502 },
    )
  }
}
