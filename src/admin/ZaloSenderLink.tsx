'use client'

import Link from 'next/link'
import React from 'react'

const ZaloSenderLink = () => {
  return (
    <div className="nav-group">
      <Link
        href="/admin/management/zalo-sender"
        className="nav__link"
        style={{
          textDecoration: 'none',
          color: 'var(--theme-elevation-500)',
          padding: '0.5rem 0',
          display: 'block',
        }}
      >
        <span className="nav__label">Gửi ZNS / Zalo</span>
      </Link>
    </div>
  )
}

export default ZaloSenderLink
