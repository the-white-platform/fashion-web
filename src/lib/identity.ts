// Helpers for the "email-or-phone" auth flow. Centralised here so the
// register page, login page, register-identity route, and
// login-identity route all agree on the same parsing + synthetic
// email format — a divergence between any of them would strand
// users who can't sign in after signup.
//
// Synthetic email format:
//   phone signup:  <normalisedPhone>@phone.thewhite.cool
//   zalo signup:   zalo-<zaloUserId>@zalo.thewhite.cool
// Order/transactional email hooks must skip these domains because
// they are not deliverable mailboxes.

export const SYNTHETIC_PHONE_DOMAIN = 'phone.thewhite.cool'
export const SYNTHETIC_ZALO_DOMAIN = 'zalo.thewhite.cool'

/**
 * Is this string shaped like an email? The register form lets the
 * user type either an email or a phone number into a single field;
 * this predicate routes which side of the backend handles it.
 * Intentionally permissive — server-side validation catches the
 * actual RFC-level garbage.
 */
export function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed.includes('@')) return false
  const [local, domain] = trimmed.split('@')
  return Boolean(local) && Boolean(domain) && domain.includes('.')
}

/**
 * Strip formatting from a raw phone input and normalise to the
 * Vietnamese domestic form `0XXXXXXXXX`. Accepts:
 *   - +84 901 234 567   → 0901234567
 *   - 84 901-234-567    → 0901234567
 *   - 0901 234 567      → 0901234567
 *   - 901234567 (9-digit, no leading 0) → 0901234567
 * Returns null when the input can't plausibly be a VN mobile number
 * (wrong length, non-digit-after-strip, etc).
 */
export function normaliseVnPhone(raw: string): string | null {
  if (typeof raw !== 'string') return null
  const digits = raw.replace(/\D+/g, '')
  if (!digits) return null
  // `+84` → `0`: drop leading country code
  let normalised = digits
  if (normalised.startsWith('84') && normalised.length === 11) {
    normalised = '0' + normalised.slice(2)
  }
  // Bare 9 digits (e.g. 901234567) → prepend leading 0
  if (normalised.length === 9) {
    normalised = '0' + normalised
  }
  // VN mobiles are 10 digits starting with 0. Landlines can be 10-11
  // digits but we gate on mobile here because we hand numbers to
  // Zalo ZNS, which only delivers to mobile.
  if (normalised.length !== 10 || !normalised.startsWith('0')) return null
  return normalised
}

/**
 * Is this input plausibly a VN phone? Lower bar than
 * `normaliseVnPhone` returning non-null — kept in sync so the
 * single-field identifier picker can route on shape without
 * prematurely rejecting user input.
 */
export function looksLikeVnPhone(value: string): boolean {
  const digits = value.replace(/\D+/g, '')
  return digits.length >= 9 && digits.length <= 11
}

/**
 * Build the synthetic email stored on the Payload users record for a
 * phone-only signup. Payload auth requires email + unique; using a
 * domain we control avoids collisions with real mail and makes
 * downstream email-send guards trivial (domain match).
 */
export function syntheticEmailForPhone(normalisedPhone: string): string {
  return `${normalisedPhone}@${SYNTHETIC_PHONE_DOMAIN}`
}

/** Same pattern for Zalo OAuth users — keyed on the Zalo user id. */
export function syntheticEmailForZalo(zaloUserId: string): string {
  return `zalo-${zaloUserId}@${SYNTHETIC_ZALO_DOMAIN}`
}

/**
 * True when `email` is one of the internally-synthesised addresses.
 * Transactional email hooks must skip these to avoid hard bounces.
 */
export function isSyntheticEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const lower = email.toLowerCase()
  return lower.endsWith(`@${SYNTHETIC_PHONE_DOMAIN}`) || lower.endsWith(`@${SYNTHETIC_ZALO_DOMAIN}`)
}
