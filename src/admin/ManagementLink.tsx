'use client'

import Link from 'next/link'
import React from 'react'

/**
 * Sidebar link from the Payload admin panel across to the
 * separate /management ops dashboard. Any user who can see the
 * Payload admin can also enter /management (admins always; the
 * guard on /management accepts `admin` + `manager`).
 */
const ManagementLink: React.FC = () => {
  return (
    <div className="nav-group">
      <Link
        href="/management"
        className="nav__link"
        style={{
          textDecoration: 'none',
          color: 'var(--theme-elevation-500)',
          padding: '0.5rem 0',
          display: 'block',
        }}
      >
        <span className="nav__label">Management →</span>
      </Link>
    </div>
  )
}

export default ManagementLink
