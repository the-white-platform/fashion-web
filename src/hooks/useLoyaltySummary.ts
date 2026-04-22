'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'

export interface LoyaltySummary {
  points: number
  lifetimePoints: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

// In-memory cache keyed by user id. Survives re-mounts within the
// same navigation session so every header badge + sidebar + home CTA
// doesn't re-fetch `/api/loyalty-accounts` on each route change. The
// order-confirmation hook on the server writes the final balance,
// so cache staleness only matters across logins/registration — both
// of which reset the cache via `user.id` changing.
const cache = new Map<string, LoyaltySummary>()

/**
 * Fetch the current user's loyalty summary (points + tier). Returns
 * `null` while loading or when the user isn't logged in. Safe to use
 * as-is from Client Components; no external deps beyond UserContext.
 */
export function useLoyaltySummary(): {
  summary: LoyaltySummary | null
  isLoading: boolean
} {
  const { user } = useUser()
  const [summary, setSummary] = useState<LoyaltySummary | null>(() =>
    user ? (cache.get(user.id) ?? null) : null,
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setSummary(null)
      return
    }
    const cached = cache.get(user.id)
    if (cached) {
      setSummary(cached)
      return
    }

    let cancelled = false
    setIsLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/loyalty-accounts?where[user][equals]=${user.id}&limit=1`, {
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        const acc = data?.docs?.[0]
        if (cancelled) return
        const next: LoyaltySummary = {
          points: acc?.points ?? 0,
          lifetimePoints: acc?.lifetimePoints ?? 0,
          tier: (acc?.tier as LoyaltySummary['tier']) ?? 'bronze',
        }
        cache.set(user.id, next)
        setSummary(next)
      } catch {
        // swallow — header badge is decorative; never block page render
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  return { summary, isLoading }
}
