import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { zaloSendZNS } from '@/lib/zalo'
import {
  statusFromZnsResult,
  writeZaloDeliveryStatusByPhone,
} from '@/utilities/updateZaloDeliveryStatus'

interface TestZnsBody {
  phone?: string
  templateId?: string
  templateData?: Record<string, string>
}

/**
 * Admin-only: send a test ZNS message to a phone number using the
 * configured Zalo OA credentials. Useful for verifying template
 * IDs + parameter mappings without placing a real order or going
 * through the OTP flow.
 *
 * Phone is normalised to `84xxxxxxxxx` (Zalo's expected format).
 * `templateData` keys must match the parameter names registered in
 * the Zalo ZNS template exactly.
 */
export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user || user.collection !== 'users' || (user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  let body: TestZnsBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawPhone = (body.phone || '').replace(/\D+/g, '')
  if (!rawPhone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })
  const phone = rawPhone.startsWith('0') ? `84${rawPhone.slice(1)}` : rawPhone

  const templateId = (body.templateId || '').trim()
  if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 })

  const templateData =
    body.templateData && typeof body.templateData === 'object'
      ? (body.templateData as Record<string, string>)
      : {}

  try {
    const result = await zaloSendZNS({
      phone,
      templateId,
      templateData,
      trackingId: `admin-test-${Date.now()}`,
    })
    const derived = statusFromZnsResult(result)
    if (derived) await writeZaloDeliveryStatusByPhone(phone, derived)
    if (!result.ok) {
      payload.logger.warn({
        msg: 'admin/zalo/test-zns rejected',
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      })
      return NextResponse.json(
        { error: `Zalo rejected: ${result.errorCode} ${result.errorMessage}`, result },
        { status: 502 },
      )
    }
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: 'admin/zalo/test-zns failed', err: msg })
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
