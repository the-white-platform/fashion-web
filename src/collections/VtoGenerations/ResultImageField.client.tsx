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

// Chrome (and most modern browsers) block top-level navigation to
// `data:` URLs — an `<a href="data:…" target="_blank">` opens a
// blank tab. Convert the base64 payload to a Blob + objectURL,
// which navigates fine. Falls back to rendering the image into a
// freshly-opened document if the blob route fails (e.g. popup
// blocker returned null).
function openDataUrlInNewTab(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/)
  if (!match) {
    window.open(dataUrl, '_blank', 'noopener,noreferrer')
    return
  }
  const [, mime, base64] = match
  try {
    const bytes = atob(base64)
    const buf = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i)
    const blob = new Blob([buf], { type: mime })
    const blobUrl = URL.createObjectURL(blob)
    const win = window.open(blobUrl, '_blank', 'noopener,noreferrer')
    // Release the object URL once the new tab is loaded (or
    // after a grace period if popup was blocked).
    setTimeout(() => URL.revokeObjectURL(blobUrl), win ? 60_000 : 0)
  } catch {
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (win) {
      win.document.write(
        `<img src="${dataUrl}" style="max-width:100%;height:auto;display:block;margin:0 auto" />`,
      )
      win.document.close()
    }
  }
}

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
        <button
          type="button"
          onClick={() => openDataUrlInNewTab(dataUrl)}
          style={{
            marginLeft: 8,
            fontSize: 12,
            background: 'transparent',
            border: 0,
            padding: 0,
            color: '#1a6aff',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Open full-size in new tab
        </button>
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
