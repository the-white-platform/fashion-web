'use client'

import React, { useEffect, useState } from 'react'

type ZaloStatus = 'unknown' | 'verified' | 'not_on_zalo'

interface BirthdayRow {
  id: string | number
  name: string | null
  phone: string | null
  email: string | null
  dateOfBirth: string | null
  zaloDeliveryStatus: ZaloStatus
  daysAway: number
}

const statusPalette: Record<ZaloStatus, { label: string; bg: string; fg: string }> = {
  verified: { label: '✓ Zalo', bg: '#dcfce7', fg: '#166534' },
  not_on_zalo: { label: '✕ No Zalo', bg: '#fee2e2', fg: '#991b1b' },
  unknown: { label: '? Unknown', bg: '#f3f4f6', fg: '#374151' },
}

const dayLabel = (n: number) => {
  if (n === 0) return 'Today 🎂'
  if (n === 1) return 'Tomorrow'
  return `${n} days`
}

const formatDob = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

/** Compute dd/MM/yyyy label (zero-padded) for now + expireDays. */
const expireDateLabel = (expireDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + expireDays)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

const CUSTOMER_DISCOUNT_TEMPLATE_ID = process.env.NEXT_PUBLIC_ZALO_ZNS_CUSTOMER_DISCOUNT ?? '572054'

interface BulkResult {
  total: number
  sent: number
  failed: number
}

export const BirthdayAlerts: React.FC = () => {
  const [rows, setRows] = useState<BirthdayRow[] | null>(null)
  const [err, setErr] = useState<string>('')
  const [windowDays, setWindowDays] = useState(7)

  // Bulk send state
  const [bulkRunning, setBulkRunning] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null)
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null)

  useEffect(() => {
    let cancelled = false
    setRows(null)
    setErr('')
    setBulkResult(null)
    fetch(`/api/admin/users/upcoming-birthdays?days=${windowDays}`, {
      credentials: 'include',
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json() as Promise<{ users: BirthdayRow[] }>
      })
      .then((body) => {
        if (!cancelled) setRows(body.users)
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [windowDays])

  const verifiedRows = rows ? rows.filter((r) => r.zaloDeliveryStatus === 'verified') : []
  const canBulkSend = !bulkRunning && verifiedRows.length > 0

  const sendAllVouchers = async () => {
    if (!canBulkSend) return
    setBulkRunning(true)
    setBulkResult(null)
    setBulkProgress({ done: 0, total: verifiedRows.length })

    const EXPIRE_DAYS = 14
    const DISCOUNT_PERCENT = 15

    let sent = 0
    let failed = 0

    for (const row of verifiedRows) {
      try {
        const res = await fetch('/api/admin/zalo/send-to-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            userId: row.id,
            templateId: CUSTOMER_DISCOUNT_TEMPLATE_ID,
            mintCoupon: {
              discountPercent: DISCOUNT_PERCENT,
              expireDays: EXPIRE_DAYS,
              condition: 'Sản phẩm bất kỳ',
              reason: 'Chúc mừng sinh nhật',
            },
            templateData: {
              customer_name: row.name || 'Khách hàng',
              voucher_code: 'AUTO',
              voucher_discount: `${DISCOUNT_PERCENT}%`,
              expire_date: expireDateLabel(EXPIRE_DAYS),
              voucher_condition: 'Sản phẩm bất kỳ',
              reason: 'Chúc mừng sinh nhật',
            },
          }),
        })
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean }
        if (res.ok && body.ok !== false) {
          sent++
        } else {
          failed++
        }
      } catch {
        failed++
      }
      setBulkProgress({ done: sent + failed, total: verifiedRows.length })
    }

    setBulkRunning(false)
    setBulkResult({ total: verifiedRows.length, sent, failed })
    setBulkProgress(null)
  }

  return (
    <div style={panel}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <strong style={{ fontSize: 15 }}>🎂 Upcoming birthdays</strong>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Bulk send button */}
          <button
            onClick={sendAllVouchers}
            disabled={!canBulkSend || rows === null}
            style={{
              padding: '5px 10px',
              fontSize: 12,
              background: canBulkSend ? '#111827' : '#e5e7eb',
              color: canBulkSend ? '#fff' : '#9ca3af',
              border: 'none',
              borderRadius: 4,
              cursor: canBulkSend ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >
            {bulkRunning && bulkProgress
              ? `Sent ${bulkProgress.done} / ${bulkProgress.total}`
              : `Send voucher to all Zalo-verified${verifiedRows.length > 0 ? ` (${verifiedRows.length})` : ''}`}
          </button>

          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            style={selectStyle}
          >
            <option value={3}>Next 3 days</option>
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
        </div>
      </div>

      {/* Bulk result toast */}
      {bulkResult && (
        <div
          style={{
            marginBottom: 10,
            padding: '7px 12px',
            borderRadius: 4,
            fontSize: 13,
            background: bulkResult.failed > 0 ? '#fef2f2' : '#ecfdf5',
            color: bulkResult.failed > 0 ? '#7f1d1d' : '#065f46',
          }}
        >
          Bulk send complete: {bulkResult.sent} succeeded
          {bulkResult.failed > 0 ? `, ${bulkResult.failed} failed` : ''} (of {bulkResult.total}{' '}
          verified).
        </div>
      )}

      {err && <div style={errorBox}>{err}</div>}
      {!rows && !err && <div style={muted}>Loading…</div>}
      {rows && rows.length === 0 && <div style={muted}>No upcoming birthdays in this window.</div>}

      {rows && rows.length > 0 && (
        <div style={{ display: 'grid', gap: 6 }}>
          {rows.map((r) => {
            const palette = statusPalette[r.zaloDeliveryStatus]
            const href = `/management/zalo-sender?userId=${encodeURIComponent(String(r.id))}&preset=customerDiscount`
            return (
              <div key={String(r.id)} style={row}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{r.name || '(no name)'}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {formatDob(r.dateOfBirth)} · {dayLabel(r.daysAway)} · {r.phone || '—'}
                  </div>
                </div>
                <span
                  style={{
                    background: palette.bg,
                    color: palette.fg,
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {palette.label}
                </span>
                <a href={href} style={sendBtn}>
                  Send voucher
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const panel: React.CSSProperties = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  padding: 16,
  marginBottom: 16,
  color: '#111827',
}
const muted: React.CSSProperties = { fontSize: 13, color: '#6b7280' }
const errorBox: React.CSSProperties = {
  fontSize: 12,
  color: '#7f1d1d',
  background: '#fef2f2',
  padding: '6px 10px',
  borderRadius: 4,
}
const selectStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontSize: 12,
  background: '#fff',
  color: '#111827',
}
const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 10px',
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 4,
}
const sendBtn: React.CSSProperties = {
  padding: '6px 10px',
  background: '#111827',
  color: '#fff',
  borderRadius: 4,
  fontSize: 12,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}

export default BirthdayAlerts
