import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sendCustomerEmail } from '@/utilities/sendCustomerEmail'
import { sendZaloOtp } from '@/utilities/sendZaloOtp'
import {
  looksLikeEmail,
  looksLikeVnPhone,
  normaliseVnPhone,
  isSyntheticEmail,
} from '@/lib/identity'
import { OTP_EXPIRY_MINUTES, OTP_MIN_REQUEST_INTERVAL_MS, generateOtp, hashOtp } from '@/lib/otp'

type OtpPurpose = 'login' | 'signup' | 'reset_password' | 'verify_email' | 'two_factor'

interface RequestBody {
  identifier?: string
  purpose?: OtpPurpose
  locale?: 'vi' | 'en'
}

/**
 * Issue a 6-digit OTP to the caller's email. Accepts email OR
 * Vietnamese phone as identifier; phone is resolved to the user
 * record's email field. Rejects synthetic addresses
 * (`@phone.thewhite.cool` / `@zalo.thewhite.cool`) because those
 * aren't deliverable mailboxes — those accounts must log in with
 * their password (or wire up SMS OTP separately).
 *
 * To prevent user-enumeration, the route returns `200 { sent: true }`
 * even when the identifier doesn't match an account. Only malformed
 * input returns 400.
 */
export async function POST(request: Request) {
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawIdentifier = (body.identifier || '').trim()
  const purpose: OtpPurpose = body.purpose ?? 'login'
  const locale: 'vi' | 'en' = body.locale === 'en' ? 'en' : 'vi'

  if (!rawIdentifier) {
    return NextResponse.json({ error: 'Identifier is required' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  let userEmail: string | null = null
  let userPhone: string | null = null
  let userId: number | string | null = null

  if (looksLikeEmail(rawIdentifier)) {
    const email = rawIdentifier.toLowerCase()
    const res = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })
    const user = res.docs[0]
    if (user) {
      userEmail = user.email
      userPhone = (user as { phone?: string | null }).phone ?? null
      userId = user.id
    }
  } else if (looksLikeVnPhone(rawIdentifier)) {
    const phone = normaliseVnPhone(rawIdentifier)
    if (!phone) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    const res = await payload.find({
      collection: 'users',
      where: { phone: { equals: phone } },
      limit: 1,
    })
    const user = res.docs[0]
    if (user) {
      userEmail = user.email
      userPhone = (user as { phone?: string | null }).phone ?? null
      userId = user.id
    }
  } else {
    return NextResponse.json(
      { error: 'Identifier must be a valid email or Vietnamese phone number' },
      { status: 400 },
    )
  }

  // Silent success on unknown identifier to avoid user-enumeration.
  if (!userId || !userEmail) {
    return NextResponse.json({ sent: true })
  }

  // Delivery channel: real email preferred (cheapest, bilingual
  // templates). Synthetic-email accounts (phone-only / Zalo)
  // fall back to Zalo ZNS OTP via phone. No phone either →
  // user has to sign in with password.
  const useZaloZns = isSyntheticEmail(userEmail)
  if (useZaloZns && !userPhone) {
    return NextResponse.json(
      { error: 'No email or phone on file for this account. Sign in with your password.' },
      { status: 400 },
    )
  }

  // Rate limit: one OTP per account per OTP_MIN_REQUEST_INTERVAL_MS.
  const userDoc = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
  const lastRequested = (userDoc as { otpRequestedAt?: string }).otpRequestedAt
  if (lastRequested) {
    const msSince = Date.now() - new Date(lastRequested).getTime()
    if (msSince < OTP_MIN_REQUEST_INTERVAL_MS) {
      const retryIn = Math.ceil((OTP_MIN_REQUEST_INTERVAL_MS - msSince) / 1000)
      return NextResponse.json(
        { error: `Please wait ${retryIn}s before requesting another code.` },
        { status: 429, headers: { 'Retry-After': String(retryIn) } },
      )
    }
  }

  const code = generateOtp()
  const codeHash = hashOtp(code, userId)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000)

  try {
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        otpHash: codeHash,
        otpExpiresAt: expiresAt.toISOString(),
        otpRequestedAt: now.toISOString(),
      },
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'otp/request: failed to persist OTP' })
    return NextResponse.json({ error: 'Failed to issue code' }, { status: 500 })
  }

  if (useZaloZns && userPhone) {
    const zaloResult = await sendZaloOtp({ phone: userPhone, code })
    if (!zaloResult.delivered) {
      payload.logger.error({ msg: 'otp/request: zalo zns send failed', reason: zaloResult.reason })
      return NextResponse.json(
        { error: `Failed to send OTP via Zalo: ${zaloResult.reason}` },
        { status: 502 },
      )
    }
  } else {
    try {
      await sendCustomerEmail({
        payload,
        to: userEmail,
        template: 'otp',
        data: {
          code,
          locale,
          purpose,
          expiresInMinutes: OTP_EXPIRY_MINUTES,
        },
      })
    } catch (err) {
      payload.logger.error({ err, msg: 'otp/request: email send failed' })
      // Non-fatal to the caller's flow; the code is already stored,
      // and sendCustomerEmail itself already swallows Resend errors.
    }
  }

  // Dev-only shortcut: log the plaintext code so developers can
  // verify the flow without a real email provider configured. Never
  // enabled outside development — production ships with
  // NODE_ENV=production baked into the Cloud Run image.
  if (process.env.NODE_ENV === 'development') {
    payload.logger.info(`[otp/request] dev-log code for ${userEmail}: ${code}`)
  }

  return NextResponse.json({ sent: true })
}
