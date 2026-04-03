'use client'

import Link from 'next/link'
import React from 'react'

const ChatDashboardLink = () => {
  return (
    <div className="nav-group">
      <Link
        href="/admin/chat-dashboard"
        className="nav__link"
        style={{
          textDecoration: 'none',
          color: 'var(--theme-elevation-500)',
          padding: '0.5rem 0',
          display: 'block',
        }}
      >
        <span className="nav__label">Chat Dashboard</span>
      </Link>
    </div>
  )
}

export default ChatDashboardLink
