import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { zaloSendZNS } from '@/lib/zalo'
import { statusFromZnsResult, writeZaloDeliveryStatus } from '@/utilities/updateZaloDeliveryStatus'

interface MintCoupon {
  discountPercent?: number
  expireDays?: number
  condition?: string
  reason?: string
}

interface Body {
  userId?: string | number
  templateId?: string
  templateData?: Record<string, string>
  // Optional phone override — when the admin wants to target a
  // phone that isn't yet stored on the user. Falls back to the
  // user's `phone` field when omitted.
  phone?: string
  // When present, auto-mint a single-use coupon and fill in
  // voucher_code + expire_date in the template data.
  mintCoupon?: MintCoupon
}

/** Generate a random 6-char alphanumeric uppercase suffix. */
function randomAlphanum(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

/** Format a Date as dd/MM/yyyy (Vietnamese convention). */
function formatDdMmYyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Admin-only: deliver a ZNS template to a specific customer by
 * user id. Wraps `zaloSendZNS` with phone lookup + normalisation
 * + bookkeeping write to `users.zaloDeliveryStatus`. Returns the
 * raw Zalo error info on rejection so the admin UI can surface
 * "phone not on Zalo" vs "template wrong" distinctly.
 *
 * When `mintCoupon` is present in the body, a single-use Coupons
 * row is created first and `templateData.voucher_code` /
 * `templateData.expire_date` are overwritten with the real values.
 */
export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user: actor } = await payload.auth({ headers })
  if (!actor || actor.collection !== 'users' || (actor as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const templateId = (body.templateId || '').trim()
  if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 })

  const templateData: Record<string, string> =
    body.templateData && typeof body.templateData === 'object' ? { ...body.templateData } : {}

  const target = await payload
    .findByID({ collection: 'users', id: body.userId, depth: 0, overrideAccess: true })
    .catch(() => null)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const rawPhone = ((body.phone ?? (target as { phone?: string }).phone) || '').replace(/\D+/g, '')
  if (!rawPhone) return NextResponse.json({ error: 'User has no phone on file' }, { status: 400 })
  const phone = rawPhone.startsWith('0') ? `84${rawPhone.slice(1)}` : rawPhone

  // --- Optional coupon minting ---
  let mintedCoupon: { id: string | number; code: string } | null = null

  if (body.mintCoupon) {
    const { discountPercent = 15, expireDays = 14, condition, reason } = body.mintCoupon

    const code = `TW-BDAY-${randomAlphanum(6)}`
    const now = new Date()
    const validUntil = new Date(now)
    validUntil.setDate(validUntil.getDate() + expireDays)

    const descParts: string[] = []
    if (reason) descParts.push(reason)
    if (condition) descParts.push(condition)

    try {
      const created = await payload.create({
        collection: 'coupons',
        overrideAccess: true,
        data: {
          code,
          type: 'percentage',
          value: discountPercent,
          description: descParts.join(' · ') || `${discountPercent}% birthday discount`,
          usageLimit: 1,
          usageCount: 0,
          validFrom: now.toISOString(),
          validUntil: validUntil.toISOString(),
          active: true,
        },
      })

      mintedCoupon = { id: created.id, code }

      // Overwrite template fields with the real generated values.
      templateData.voucher_code = code
      templateData.expire_date = formatDdMmYyyy(validUntil)
      // Ensure voucher_discount reflects the computed value unless
      // admin explicitly set something different already.
      if (!templateData.voucher_discount || templateData.voucher_discount === 'AUTO') {
        templateData.voucher_discount = `${discountPercent}%`
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      payload.logger.error({ msg: 'admin/zalo/send-to-user: coupon mint failed', err: msg })
      return NextResponse.json({ error: `Coupon creation failed: ${msg}` }, { status: 500 })
    }
  }

  try {
    const result = await zaloSendZNS({
      phone,
      templateId,
      templateData,
      trackingId: `admin-user-${target.id}-${Date.now()}`,
    })
    const derived = statusFromZnsResult(result)
    if (derived) await writeZaloDeliveryStatus(target.id, derived)

    if (!result.ok) {
      payload.logger.warn({
        msg: 'admin/zalo/send-to-user rejected',
        userId: target.id,
        templateId,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      })
      // Translate opaque Zalo errors into admin-actionable hints.
      // 404 "empty api" = OA app has no ZNS scope yet — the OA
      // dashboard needs ZNS activation + business verification.
      // -124 / -129 = phone isn't on Zalo (not our problem).
      // -132 = template not approved by Zalo moderation.
      let hint: string | undefined
      if (result.errorCode === 404 && /empty api/i.test(result.errorMessage)) {
        hint =
          'Zalo OA chưa kích hoạt ZNS. Vào https://business.zalo.me → OA dashboard → Zalo Notification Service → Register + xác minh doanh nghiệp + nạp credit + duyệt template trước khi gửi.'
      } else if ([-124, -129].includes(result.errorCode)) {
        hint = 'Số điện thoại không đăng ký Zalo. Thử email thay thế.'
      } else if (result.errorCode === -125) {
        hint = 'User đã chặn OA. Không thể gửi ZNS.'
      } else if (result.errorCode === -132) {
        hint = 'Template chưa được Zalo duyệt. Kiểm tra trạng thái template trên OA dashboard.'
      }
      return NextResponse.json(
        {
          ok: false,
          errorCode: result.errorCode,
          errorMessage: result.errorMessage || 'Zalo rejected the send',
          hint,
          zaloDeliveryStatus: derived ?? 'unknown',
          coupon: mintedCoupon,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      zaloDeliveryStatus: derived ?? 'verified',
      result,
      coupon: mintedCoupon,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: 'admin/zalo/send-to-user failed', err: msg })
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
