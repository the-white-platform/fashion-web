/**
 * Build a user-facing error message that appends the real upstream
 * detail (Error.message, Payload's `errors[0].message`, or a plain
 * string) onto a localized fallback prompt.
 *
 * Used on auth + self-service forms so customers / staff see
 * something like:
 *   "Đăng ký thất bại. This phone number is already registered."
 * instead of a generic retry blob. Keep the detail terse — React
 * Query / Payload payloads can be verbose, so trim + guard for
 * Response / Error / plain object / string inputs.
 */
export function describeError(err: unknown, fallback: string): string {
  const detail = extractDetail(err)
  if (!detail) return fallback
  return `${fallback} ${detail}`.trim()
}

function extractDetail(err: unknown): string | null {
  if (!err) return null
  if (typeof err === 'string') return truncate(err)

  if (err instanceof Error) {
    return truncate(err.message)
  }

  if (typeof err === 'object') {
    const anyErr = err as Record<string, unknown>
    // Payload REST responses: `{ errors: [{ message: "..." }] }`
    const errorsArr = anyErr.errors
    if (Array.isArray(errorsArr) && errorsArr.length > 0) {
      const first = errorsArr[0] as Record<string, unknown>
      if (typeof first?.message === 'string') return truncate(first.message)
    }
    if (typeof anyErr.message === 'string') return truncate(anyErr.message)
    if (typeof anyErr.error === 'string') return truncate(anyErr.error)
  }

  return null
}

function truncate(s: string, max = 200): string {
  const trimmed = s.trim()
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max - 1) + '…'
}
