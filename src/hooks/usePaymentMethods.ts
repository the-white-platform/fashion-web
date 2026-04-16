'use client'

import { useEffect, useState } from 'react'

/**
 * Shape we care about from the PaymentMethods global.
 * Other fields exist but are unused on the checkout screens.
 */
export interface PaymentMethodsData {
  bankTransfer?: {
    enabled?: boolean
    bankName?: string | null
    accountNumber?: string | null
    accountName?: string | null
    branch?: string | null
  } | null
  cod?: { enabled?: boolean } | null
  qrCode?: { enabled?: boolean } | null
}

// Module-scoped cache so the 2-3 checkout steps sharing this hook hit
// /api/globals/payment-methods exactly once per page load.
let cached: PaymentMethodsData | null = null
let inflight: Promise<PaymentMethodsData | null> | null = null

async function load(): Promise<PaymentMethodsData | null> {
  if (cached) return cached
  if (inflight) return inflight
  inflight = fetch('/api/globals/payment-methods', { credentials: 'include' })
    .then((r) => (r.ok ? (r.json() as Promise<PaymentMethodsData>) : null))
    .then((data) => {
      cached = data
      return data
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })
  return inflight
}

export function usePaymentMethods(): PaymentMethodsData | null {
  const [data, setData] = useState<PaymentMethodsData | null>(cached)
  useEffect(() => {
    if (cached) {
      setData(cached)
      return
    }
    let cancelled = false
    load().then((d) => {
      if (!cancelled) setData(d)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return data
}
