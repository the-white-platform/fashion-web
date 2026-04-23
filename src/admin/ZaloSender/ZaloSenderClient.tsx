'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ZaloStatus = 'unknown' | 'verified' | 'not_on_zalo'

interface AdminUser {
  id: string | number
  name: string | null
  email: string | null
  phone: string | null
  role: string
  provider: string
  dateOfBirth: string | null
  zaloDeliveryStatus: ZaloStatus
}

interface TemplatePreset {
  key: string
  label: string
  templateId: string
  description: string
  defaults: Record<string, string>
  // Derive sensible defaults from the selected user (e.g. use
  // the user's real name for customer_name).
  fromUser?: (u: AdminUser) => Record<string, string>
}

const todayVi = () => new Date().toLocaleDateString('vi-VN')
const inDaysVi = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('vi-VN')
}

const PRESETS: TemplatePreset[] = [
  {
    key: 'otp',
    label: 'OTP',
    templateId: process.env.NEXT_PUBLIC_ZALO_ZNS_OTP ?? '569407',
    description: 'One-time passcode (single `otp` parameter).',
    defaults: { otp: '123456' },
  },
  {
    key: 'orderStatus',
    label: 'Cập nhật đơn hàng',
    templateId: process.env.NEXT_PUBLIC_ZALO_ZNS_ORDER_STATUS ?? '569406',
    description:
      'Order status update — requires order_code, date, price, name, phone_number, product_info, status.',
    defaults: {
      order_code: 'TW-TEST-0001',
      date: todayVi(),
      price: '500000',
      name: 'Khách hàng',
      phone_number: '0900000000',
      product_info: 'Áo thun trắng x1',
      status: 'Đã xác nhận',
    },
    fromUser: (u) => ({
      name: u.name ?? 'Khách hàng',
      phone_number: u.phone ?? '',
    }),
  },
  {
    key: 'welcome',
    label: 'Chào mừng (welcome)',
    templateId: process.env.NEXT_PUBLIC_ZALO_ZNS_WELCOME ?? '572063',
    description:
      'First-time welcome after a user adds their phone. Params: customer_name, company_name (plus any extra keys the template requires).',
    defaults: {
      customer_name: 'Khách hàng',
      company_name: 'THE WHITE ACTIVE',
    },
    fromUser: (u) => ({ customer_name: u.name ?? 'Khách hàng' }),
  },
  {
    key: 'customerDiscount',
    label: 'Mã giảm giá khách hàng (sinh nhật)',
    templateId: process.env.NEXT_PUBLIC_ZALO_ZNS_CUSTOMER_DISCOUNT ?? '572054',
    description:
      'Birthday / promo voucher. Params: customer_name, voucher_code, voucher_discount, expire_date, voucher_condition, reason.',
    defaults: {
      customer_name: 'Khách hàng',
      voucher_code: 'TW-BDAY-XXXXXX',
      voucher_discount: '15%',
      expire_date: inDaysVi(14),
      voucher_condition: 'Sản phẩm bất kỳ',
      reason: 'Chúc mừng sinh nhật',
    },
    fromUser: (u) => ({ customer_name: u.name ?? 'Khách hàng' }),
  },
  {
    key: 'custom',
    label: 'Custom (nhập template ID)',
    templateId: '',
    description: 'Enter any template id + JSON manually.',
    defaults: {},
  },
]

const statusPalette: Record<ZaloStatus, { label: string; bg: string; fg: string }> = {
  verified: { label: '✓ Có Zalo', bg: '#dcfce7', fg: '#166534' },
  not_on_zalo: { label: '✕ Không có Zalo', bg: '#fee2e2', fg: '#991b1b' },
  unknown: { label: '? Chưa xác định', bg: '#f3f4f6', fg: '#374151' },
}

interface SendResponse {
  ok?: boolean
  errorCode?: number
  errorMessage?: string
  zaloDeliveryStatus?: ZaloStatus
  error?: string
  coupon?: { id: string | number; code: string } | null
}

const OTP_TEMPLATE_ID = process.env.NEXT_PUBLIC_ZALO_ZNS_OTP ?? '569407'

export const ZaloSenderClient: React.FC<{ initialUserId?: string; initialPreset?: string }> = ({
  initialUserId,
  initialPreset,
}) => {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [presetKey, setPresetKey] = useState<string>(initialPreset ?? 'customerDiscount')
  const [templateId, setTemplateId] = useState<string>('')
  const [dataJson, setDataJson] = useState<string>('')
  const [phoneOverride, setPhoneOverride] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sending' | 'ok' | 'error'>('idle')
  const [detail, setDetail] = useState<string>('')
  const [searchLoading, setSearchLoading] = useState(false)

  // Keyboard navigation state for user picker
  const [highlightIdx, setHighlightIdx] = useState<number>(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Coupon minting state (only relevant for customerDiscount preset)
  const [mintCoupon, setMintCoupon] = useState(true)
  const [discountPercent, setDiscountPercent] = useState(15)
  const [expireDays, setExpireDays] = useState(14)

  // Probe Zalo state
  const [probing, setProbing] = useState(false)

  const preset = useMemo(() => PRESETS.find((p) => p.key === presetKey) ?? PRESETS[0], [presetKey])

  // Apply preset when changed or when selected user changes.
  useEffect(() => {
    if (!preset) return
    setTemplateId(preset.templateId)
    const base = { ...preset.defaults }
    const overlay = selected && preset.fromUser ? preset.fromUser(selected) : {}
    setDataJson(JSON.stringify({ ...base, ...overlay }, null, 2))
  }, [preset, selected])

  // Reset highlight when users list changes
  useEffect(() => {
    setHighlightIdx(-1)
  }, [users])

  // Debounced user search.
  useEffect(() => {
    let cancelled = false
    const handle = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include',
        })
        if (!res.ok) return
        const body = (await res.json()) as { users: AdminUser[] }
        if (!cancelled) setUsers(body.users)
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query])

  // Hydrate initial user from query string.
  useEffect(() => {
    if (!initialUserId) return
    fetch(`/api/admin/users/search?q=${encodeURIComponent(initialUserId)}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { users: AdminUser[] } | null) => {
        if (!body) return
        const match = body.users.find((u) => String(u.id) === String(initialUserId))
        if (match) setSelected(match)
      })
      .catch(() => undefined)
  }, [initialUserId])

  // Keyboard handler for the search input
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (users.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIdx((prev) => Math.min(prev + 1, users.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIdx((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const idx = highlightIdx >= 0 ? highlightIdx : 0
        const u = users[idx]
        if (u) setSelected(u)
      }
    },
    [users, highlightIdx],
  )

  const send = useCallback(async () => {
    if (!selected) {
      setStatus('error')
      setDetail('Select a user first.')
      return
    }
    setStatus('sending')
    setDetail('')
    let templateData: Record<string, string>
    try {
      templateData = JSON.parse(dataJson)
    } catch {
      setStatus('error')
      setDetail('Template data is not valid JSON.')
      return
    }

    const bodyPayload: Record<string, unknown> = {
      userId: selected.id,
      templateId,
      templateData,
      phone: phoneOverride.trim() || undefined,
    }

    if (presetKey === 'customerDiscount' && mintCoupon) {
      bodyPayload.mintCoupon = {
        discountPercent,
        expireDays,
        condition: templateData.voucher_condition,
        reason: templateData.reason,
      }
    }

    try {
      const res = await fetch('/api/admin/zalo/send-to-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyPayload),
      })
      const body = (await res.json().catch(() => ({}))) as SendResponse
      if (!res.ok || body.ok === false) {
        setStatus('error')
        const code = body.errorCode !== undefined ? ` (code ${body.errorCode})` : ''
        setDetail(body.errorMessage || body.error || `HTTP ${res.status}${code}`)
      } else {
        setStatus('ok')
        if (body.coupon) {
          // Build expire date label from expireDays offset
          const expDate = new Date()
          expDate.setDate(expDate.getDate() + expireDays)
          const expLabel = expDate.toLocaleDateString('vi-VN')
          setDetail(`Sent. Coupon ${body.coupon.code} valid until ${expLabel}.`)
        } else {
          setDetail('Sent. Check the recipient phone.')
        }
      }
      if (body.zaloDeliveryStatus && selected) {
        setSelected({ ...selected, zaloDeliveryStatus: body.zaloDeliveryStatus })
      }
    } catch (err) {
      setStatus('error')
      setDetail(err instanceof Error ? err.message : String(err))
    }
  }, [
    selected,
    templateId,
    dataJson,
    phoneOverride,
    presetKey,
    mintCoupon,
    discountPercent,
    expireDays,
  ])

  const probeZalo = useCallback(async () => {
    if (!selected) return
    setProbing(true)
    try {
      const res = await fetch('/api/admin/zalo/send-to-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selected.id,
          templateId: OTP_TEMPLATE_ID,
          templateData: { otp: '000000' },
        }),
      })
      const body = (await res.json().catch(() => ({}))) as SendResponse
      if (body.zaloDeliveryStatus) {
        setSelected({ ...selected, zaloDeliveryStatus: body.zaloDeliveryStatus })
      }
    } catch {
      // Ignore probe errors — status stays unknown
    } finally {
      setProbing(false)
    }
  }, [selected])

  return (
    <div style={page}>
      <h1 style={{ marginBottom: 8, color: '#111827' }}>Gửi ZNS / Zalo</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Select a customer, pick a template, review the params, and send. Zalo delivery status is
        remembered per-user after each send.
      </p>

      <div style={grid}>
        <section style={panel}>
          <h2 style={h2}>1. Customer</h2>
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name, email, or phone"
            style={input}
          />
          <div style={{ marginTop: 12, maxHeight: 360, overflowY: 'auto', color: '#111827' }}>
            {searchLoading && <div style={{ color: '#6b7280' }}>Loading…</div>}
            {!searchLoading && users.length === 0 && (
              <div style={{ color: '#6b7280' }}>No users found.</div>
            )}
            {users.map((u, idx) => {
              const active = selected?.id === u.id
              const highlighted = idx === highlightIdx
              const palette = statusPalette[u.zaloDeliveryStatus]
              return (
                <button
                  key={String(u.id)}
                  onClick={() => setSelected(u)}
                  style={{
                    ...rowBtn,
                    background: active || highlighted ? '#eef2ff' : '#fff',
                    borderColor: active || highlighted ? '#6366f1' : '#e5e7eb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong>{u.name || '(no name)'}</strong>
                    <span
                      style={{
                        background: palette.bg,
                        color: palette.fg,
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}
                    >
                      {palette.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {u.phone || '—'} · {u.email || '—'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected user status + Probe button */}
          {selected && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 10px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>
                Selected: <strong>{selected.name || selected.email}</strong>
              </span>
              <span
                style={{
                  background: statusPalette[selected.zaloDeliveryStatus].bg,
                  color: statusPalette[selected.zaloDeliveryStatus].fg,
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                }}
              >
                {statusPalette[selected.zaloDeliveryStatus].label}
              </span>
              {selected.zaloDeliveryStatus === 'unknown' && (
                <button
                  onClick={probeZalo}
                  disabled={probing}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    background: probing ? '#e5e7eb' : '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    cursor: probing ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {probing ? 'Probing…' : 'Probe Zalo'}
                </button>
              )}
            </div>
          )}
        </section>

        <section style={panel}>
          <h2 style={h2}>2. Template</h2>
          <select value={presetKey} onChange={(e) => setPresetKey(e.target.value)} style={input}>
            {PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{preset.description}</p>

          <label style={labelStyle}>
            Template ID
            <input
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              placeholder="572054"
              style={input}
            />
          </label>

          <label style={labelStyle}>
            Phone override (optional)
            <input
              value={phoneOverride}
              onChange={(e) => setPhoneOverride(e.target.value)}
              placeholder={selected?.phone ?? '0901234567'}
              style={input}
            />
          </label>

          {/* Coupon minting block — only shown for customerDiscount preset */}
          {presetKey === 'customerDiscount' && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 4,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: '#1e40af',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={mintCoupon}
                  onChange={(e) => setMintCoupon(e.target.checked)}
                  style={{ width: 14, height: 14 }}
                />
                Mint a single-use coupon automatically
              </label>
              {mintCoupon && (
                <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      fontSize: 12,
                      color: '#374151',
                      flex: 1,
                    }}
                  >
                    Discount %
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      style={{ ...input, padding: '5px 8px' }}
                    />
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      fontSize: 12,
                      color: '#374151',
                      flex: 1,
                    }}
                  >
                    Valid days
                    <input
                      type="number"
                      min={1}
                      value={expireDays}
                      onChange={(e) => setExpireDays(Number(e.target.value))}
                      style={{ ...input, padding: '5px 8px' }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          <label style={labelStyle}>
            Template data (JSON)
            <textarea
              value={dataJson}
              onChange={(e) => setDataJson(e.target.value)}
              rows={12}
              style={{ ...input, fontFamily: 'monospace', fontSize: 12 }}
            />
          </label>

          <button
            onClick={send}
            disabled={!selected || status === 'sending' || !templateId}
            style={{
              ...sendBtn,
              opacity: !selected || status === 'sending' || !templateId ? 0.5 : 1,
            }}
          >
            {status === 'sending' ? 'Sending…' : 'Send'}
          </button>

          {detail && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 12px',
                borderRadius: 4,
                fontSize: 13,
                color: status === 'error' ? '#7f1d1d' : '#065f46',
                background: status === 'error' ? '#fef2f2' : '#ecfdf5',
              }}
            >
              {detail}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const page: React.CSSProperties = { padding: 24, color: '#111827' }
const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 1.4fr)',
  gap: 16,
}
const panel: React.CSSProperties = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  padding: 16,
  color: '#111827',
}
const h2: React.CSSProperties = { fontSize: 16, margin: '0 0 12px' }
const input: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontSize: 13,
  background: '#fff',
  color: '#111827',
}
const rowBtn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 4,
  marginBottom: 6,
  cursor: 'pointer',
  color: '#111827',
}
const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 13,
  color: '#374151',
  marginTop: 12,
}
const sendBtn: React.CSSProperties = {
  marginTop: 16,
  padding: '10px 16px',
  background: '#111827',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontSize: 13,
  cursor: 'pointer',
}

export default ZaloSenderClient
