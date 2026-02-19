'use client'

import Link from 'next/link'
import React from 'react'

const AccountingLink = () => {
  return (
    <div className="nav-group">
      <Link
        href="/admin/accounting"
        className="nav__link"
        style={{
          textDecoration: 'none',
          color: 'var(--theme-elevation-500)',
          padding: '0.5rem 0',
          display: 'block',
        }}
      >
        <span className="nav__label">Accounting Dashboard</span>
      </Link>
    </div>
  )
}

export default AccountingLink
