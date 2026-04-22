'use client'

import React, { useState } from 'react'
import { useField } from '@payloadcms/ui'

// Password-gated preview of the base64 data URL stored in
// `resultData`. The gate is intentionally lightweight — VTO
// images can include user photos, so even staff with collection
// access should pass a soft confirmation before opening the
// picture on-screen. Anyone with DB access can still read the
// row, this is not real security, just a privacy speed bump.
const PASSWORD = '1423'

export const ResultImageFieldClient: React.FC<{ path?: string }> = (props) => {
  const path = props.path ?? 'resultData'
  const { value } = useField<string>({ path })
  const [unlocked, setUnlocked] = useState(false)
  const dataUrl = typeof value === 'string' ? value : ''

  const handleUnlock = () => {
    const entered = window.prompt('Nhập mật khẩu để xem ảnh / Enter password to view image')
    if (entered === PASSWORD) {
      setUnlocked(true)
    } else if (entered !== null) {
      window.alert('Sai mật khẩu / Wrong password')
    }
  }

  if (!dataUrl) {
    return (
      <div style={{ padding: '8px 0' }}>
        <em style={{ color: '#888' }}>(no image — cache-hit rows don&apos;t store the result)</em>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
        <button
          type="button"
          onClick={handleUnlock}
          style={{
            padding: '8px 14px',
            background: '#1a1a1a',
            color: '#fff',
            border: 0,
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            letterSpacing: '0.5px',
          }}
        >
          🔒 View image
        </button>
        <span style={{ fontSize: 12, color: '#888' }}>
          Password required — contains customer photo.
        </span>
      </div>
    )
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setUnlocked(false)}
          style={{
            padding: '4px 10px',
            background: 'transparent',
            color: '#1a1a1a',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Hide
        </button>
        <a
          href={dataUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: 8, fontSize: 12 }}
        >
          Open full-size in new tab
        </a>
      </div>
      <img
        src={dataUrl}
        alt="VTO result"
        style={{
          maxWidth: 420,
          width: '100%',
          height: 'auto',
          display: 'block',
          border: '1px solid #ddd',
          borderRadius: 4,
        }}
      />
    </div>
  )
}

export default ResultImageFieldClient
