'use client'

import React from 'react'
import type { DefaultCellComponentProps } from 'payload'

// Compact list-view cell for `resultData`. Shows a locked "View"
// link; clicking prompts for the password and opens the image in
// a new tab on match. Same soft gate as the edit-view field.
const PASSWORD = '1423'

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
      const w = window.open('', '_blank', 'noopener,noreferrer')
      if (w) {
        w.document.write(
          `<title>VTO result</title><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${dataUrl}" style="max-width:100%;max-height:100vh;" /></body>`,
        )
        w.document.close()
      }
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
