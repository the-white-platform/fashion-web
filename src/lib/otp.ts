import { createHmac, randomInt, timingSafeEqual } from 'crypto'

// One-time passcode helpers. Codes are 6 numeric digits; we store a
// keyed HMAC (not plaintext), which is fine for short-lived rate-
// limited codes — there's no offline-attack surface at 10-minute
// expiry + 60-second re-request throttle.
//
// Keyed with PAYLOAD_SECRET so the hash depends on a server-only
// secret; any DB exfil alone can't brute-force a 6-digit space.

export const OTP_LENGTH = 6
export const OTP_EXPIRY_MINUTES = 10
export const OTP_MIN_REQUEST_INTERVAL_MS = 60 * 1000

export function generateOtp(): string {
  // `randomInt` gives a uniform distribution. Left-pad so "007123"
  // doesn't become "7123".
  const n = randomInt(0, 10 ** OTP_LENGTH)
  return String(n).padStart(OTP_LENGTH, '0')
}

export function hashOtp(code: string, userId: number | string): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET not configured — cannot hash OTP')
  }
  return createHmac('sha256', secret).update(`${code}|${userId}`).digest('hex')
}

export function verifyOtp(submitted: string, storedHash: string, userId: number | string): boolean {
  // Reject obvious shape mismatches before computing HMAC.
  if (!submitted || !storedHash) return false
  if (submitted.length !== OTP_LENGTH) return false

  const expected = hashOtp(submitted, userId)
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(storedHash, 'hex')
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
