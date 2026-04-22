'use client'

import React, { useEffect, useState } from 'react'

// Admin-dashboard banner that tracks the Zalo OA refresh token
// expiry stored in the `zalo-credentials` global. Renders:
//
//   - nothing while the fetch is in flight or the global is empty
//     (avoids flashing a "missing" banner before the data loads)
//   - a yellow warning when the token has ≤ WARN_DAYS left
//   - a red error when it has expired
//   - a "Renew now" button that sends the admin through
//     /api/auth/zalo/oa-connect, which writes the new token back
//     into the global on return
//
// No render when the token has > WARN_DAYS left — zero noise on
// the day-to-day dashboard.

const WARN_DAYS = 14
const RENEW_URL = '/api/auth/zalo/oa-connect'

interface Summary {
  hasToken: boolean
  expiresAt: string | null
}

export const ZaloTokenBanner: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/globals/zalo-credentials?depth=0', {
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setSummary({
          hasToken: Boolean(data?.refreshToken),
          expiresAt: data?.refreshTokenExpiresAt ?? null,
        })
      } catch {
        // Admin may not have read access — silent no-op.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!summary) return null

  // Not configured yet — surface once so the admin knows the
  // Zalo-dependent features are inert.
  if (!summary.hasToken) {
    return (
      <div style={bannerStyle('info')}>
        <div>
          <strong>Zalo OA chưa kết nối.</strong> ZNS notifications will no-op until an admin links
          the OA.
        </div>
        <a href={RENEW_URL} style={buttonStyle}>
          Connect Zalo OA →
        </a>
      </div>
    )
  }

  if (!summary.expiresAt) return null

  const msLeft = new Date(summary.expiresAt).getTime() - Date.now()
  const daysLeft = Math.floor(msLeft / (24 * 60 * 60 * 1000))

  if (daysLeft > WARN_DAYS) return null

  const expired = msLeft <= 0
  const tone: 'warning' | 'error' = expired ? 'error' : 'warning'
  const message = expired
    ? 'Zalo OA refresh token has expired — no ZNS / OA messages will send until renewed.'
    : `Zalo OA refresh token expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew now to avoid downtime.`

  return (
    <div style={bannerStyle(tone)}>
      <div>
        <strong>{expired ? 'Zalo token expired' : 'Zalo token expiring'}</strong>
        <div style={{ fontSize: 13, marginTop: 2 }}>{message}</div>
      </div>
      <a href={RENEW_URL} style={buttonStyle}>
        Renew now →
      </a>
    </div>
  )
}

function bannerStyle(tone: 'warning' | 'error' | 'info'): React.CSSProperties {
  const palette: Record<typeof tone, { bg: string; border: string; fg: string }> = {
    warning: { bg: '#fff7ed', border: '#f59e0b', fg: '#78350f' },
    error: { bg: '#fef2f2', border: '#dc2626', fg: '#7f1d1d' },
    info: { bg: '#eff6ff', border: '#3b82f6', fg: '#1e3a8a' },
  }
  const p = palette[tone]
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    background: p.bg,
    border: `1px solid ${p.border}`,
    color: p.fg,
    padding: '12px 16px',
    borderRadius: 6,
    marginBottom: 16,
  }
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 14px',
  background: '#1a1a1a',
  color: '#fff',
  borderRadius: 4,
  textDecoration: 'none',
  fontSize: 13,
  whiteSpace: 'nowrap',
}

export default ZaloTokenBanner
