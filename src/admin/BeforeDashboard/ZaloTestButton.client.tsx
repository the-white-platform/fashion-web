'use client'

import React, { useState } from 'react'

// Admin-dashboard control for sending a test Zalo ZNS message.
// Lets the admin verify template IDs + parameter wiring without
// triggering a real order or OTP flow. Params come from the
// registered ZNS templates — keys must match exactly or Zalo
// rejects the send.
//
// Known templates:
//   569407 (OTP): { otp }
//   569406 (order confirmation): { order_code, date, price, name,
//     phone_number, product_info, status }
//
// The form leaves param entry free-form (templateId-specific JSON)
// so new templates can be tested without a code change.

interface Preset {
  label: string
  templateId: string
  defaults: Record<string, string>
}

const PRESETS: Preset[] = [
  {
    label: 'OTP (569407)',
    templateId: '569407',
    defaults: { otp: '123456' },
  },
  {
    label: 'Order confirmation (569406)',
    templateId: '569406',
    defaults: {
      order_code: 'TW-TEST-0001',
      date: new Date().toLocaleDateString('vi-VN'),
      price: '500000',
      name: 'Test Customer',
      phone_number: '0900000000',
      product_info: 'Áo thun trắng x1',
      status: 'Đã xác nhận',
    },
  },
]

export const ZaloTestButton: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [presetIdx, setPresetIdx] = useState(0)
  const [templateId, setTemplateId] = useState(PRESETS[0].templateId)
  const [dataJson, setDataJson] = useState(JSON.stringify(PRESETS[0].defaults, null, 2))
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [detail, setDetail] = useState<string>('')

  const applyPreset = (idx: number) => {
    setPresetIdx(idx)
    setTemplateId(PRESETS[idx].templateId)
    setDataJson(JSON.stringify(PRESETS[idx].defaults, null, 2))
  }

  const send = async () => {
    setStatus('sending')
    setDetail('')
    let templateData: Record<string, string>
    try {
      templateData = JSON.parse(dataJson)
    } catch {
      setStatus('error')
      setDetail('Invalid JSON in template data')
      return
    }
    try {
      const res = await fetch('/api/admin/zalo/test-zns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, templateId, templateData }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setDetail(typeof body?.error === 'string' ? body.error : `HTTP ${res.status}`)
        return
      }
      setStatus('ok')
      setDetail('Sent. Check the recipient phone.')
    } catch (err) {
      setStatus('error')
      setDetail(err instanceof Error ? err.message : String(err))
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={triggerStyle}>
        Test Zalo ZNS →
      </button>
    )
  }

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Send test ZNS</strong>
        <button onClick={() => setOpen(false)} style={closeStyle}>
          ×
        </button>
      </div>
      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        <label style={labelStyle}>
          Template preset
          <select
            value={presetIdx}
            onChange={(e) => applyPreset(Number(e.target.value))}
            style={inputStyle}
          >
            {PRESETS.map((p, i) => (
              <option key={p.templateId} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Template ID
          <input
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            style={inputStyle}
            placeholder="569407"
          />
        </label>
        <label style={labelStyle}>
          Phone (VN, 0xxxxxxxxx or 84xxxxxxxxx)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
            placeholder="0901234567"
          />
        </label>
        <label style={labelStyle}>
          Template data (JSON)
          <textarea
            value={dataJson}
            onChange={(e) => setDataJson(e.target.value)}
            rows={8}
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
          />
        </label>
        <button onClick={send} disabled={status === 'sending' || !phone} style={sendStyle}>
          {status === 'sending' ? 'Sending…' : 'Send test'}
        </button>
        {detail && (
          <div
            style={{
              fontSize: 13,
              color: status === 'error' ? '#7f1d1d' : '#065f46',
              background: status === 'error' ? '#fef2f2' : '#ecfdf5',
              padding: '8px 12px',
              borderRadius: 4,
            }}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  )
}

const triggerStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 14px',
  background: '#1a1a1a',
  color: '#fff',
  borderRadius: 4,
  border: 'none',
  fontSize: 13,
  cursor: 'pointer',
  marginBottom: 16,
}

const panelStyle: React.CSSProperties = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  padding: 16,
  marginBottom: 16,
}

const closeStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontSize: 20,
  cursor: 'pointer',
  color: '#6b7280',
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 13,
  color: '#374151',
}

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontSize: 13,
  background: '#fff',
}

const sendStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#1a1a1a',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontSize: 13,
  cursor: 'pointer',
}

export default ZaloTestButton
