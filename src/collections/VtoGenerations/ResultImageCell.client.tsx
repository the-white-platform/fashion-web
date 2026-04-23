'use client'

import React from 'react'
import type { DefaultCellComponentProps } from 'payload'

// Compact list-view cell for `resultData`. Shows a locked "View"
// link; clicking prompts for the password and opens the image in
// a new tab on match. Same soft gate as the edit-view field.
const PASSWORD = '1423'

// Chrome/Brave blocks top-level navigation to `data:` URLs (the
// source of the original "blank tab" report), and opening with
// `noopener,noreferrer` severs access to the child window so
// `w.document.write(...)` can't inject HTML either. Decode the
// base64 payload into a Blob + objectURL — navigable in a new
// tab, origin-isolated, no opener channel needed.
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
    setTimeout(() => URL.revokeObjectURL(blobUrl), win ? 60_000 : 0)
  } catch {
    // Last-resort fallback — drop `noopener` so document.write works.
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(
        `<title>VTO result</title><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${dataUrl}" style="max-width:100%;max-height:100vh;" /></body>`,
      )
      win.document.close()
    }
  }
}

export const ResultImageCellClient: React.FC<DefaultCellComponentProps> = ({ cellData }) => {
  const dataUrl = typeof cellData === 'string' ? cellData : ''

  if (!dataUrl) {
    return <span style={{ color: '#aaa' }}>—</span>
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const entered = window.prompt('Nhập mật khẩu để xem ảnh / Enter password to view image')
    if (entered === PASSWORD) {
      openDataUrlInNewTab(dataUrl)
    } else if (entered !== null) {
      window.alert('Sai mật khẩu / Wrong password')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        padding: '4px 10px',
        background: '#1a1a1a',
        color: '#fff',
        border: 0,
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 12,
      }}
    >
      🔒 View
    </button>
  )
}

export default ResultImageCellClient
