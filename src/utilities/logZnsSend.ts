import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ZaloZNSResult } from '@/lib/zalo'

export type ZnsLogStatus = 'sent' | 'rejected' | 'error' | 'skipped'
export type ZnsLogSource =
  | 'order-notification'
  | 'customer-welcome'
  | 'customer-discount'
  | 'otp'
  | 'admin-send'
  | 'admin-test'

export interface ZnsLogEntry {
  status: ZnsLogStatus
  templateId: string
  phone: string
  templateData?: Record<string, string>
  errorCode?: number
  errorMessage?: string
  recipientId?: string | number | null
  initiatorId?: string | number | null
  couponId?: string | number | null
  source: ZnsLogSource
}

/**
 * Persist a ZNS attempt to the `zns-logs` collection. Fire-and-
 * forget — failures to write the log are swallowed so they never
 * block the caller's send flow. Resolves phone → recipient user
 * best-effort when `recipientId` isn't supplied.
 */
export async function logZnsSend(entry: ZnsLogEntry): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })

    let recipientId = entry.recipientId ?? null
    if (!recipientId && entry.phone) {
      const digits = entry.phone.replace(/\D+/g, '')
      const candidates = new Set<string>([entry.phone])
      if (digits) candidates.add(digits)
      if (digits.startsWith('84')) candidates.add(`0${digits.slice(2)}`)
      if (digits.startsWith('0')) candidates.add(`84${digits.slice(1)}`)
      const result = await payload.find({
        collection: 'users',
        where: { phone: { in: Array.from(candidates) } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      recipientId = result.docs[0]?.id ?? null
    }

    const toNum = (v: string | number | null | undefined): number | null => {
      if (v === null || v === undefined) return null
      if (typeof v === 'number') return v
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }

    await payload.create({
      collection: 'zns-logs',
      overrideAccess: true,
      data: {
        status: entry.status,
        templateId: entry.templateId,
        phone: entry.phone,
        templateData: entry.templateData ?? null,
        errorCode: entry.errorCode ?? null,
        errorMessage: entry.errorMessage ?? null,
        recipient: toNum(recipientId),
        initiator: toNum(entry.initiatorId),
        coupon: toNum(entry.couponId),
        source: entry.source,
      },
    })
  } catch (err) {
    console.warn(
      `[logZnsSend] Failed to persist ZNS log: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

/**
 * Convenience: derive status + errorCode + errorMessage from a
 * `zaloSendZNS` result and persist it. For the callers that have
 * the raw result in hand.
 */
export async function logZnsResult(
  args: Omit<ZnsLogEntry, 'status' | 'errorCode' | 'errorMessage'> & {
    result: ZaloZNSResult
  },
): Promise<void> {
  const { result, ...rest } = args
  await logZnsSend({
    ...rest,
    status: result.ok ? 'sent' : 'rejected',
    errorCode: result.errorCode,
    errorMessage: result.errorMessage,
  })
}
