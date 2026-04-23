'use client'

import Link from 'next/link'
import React from 'react'

const InventoryAlertsLink = () => {
  return (
    <div className="nav-group">
      <Link
        href="/admin/management/inventory-alerts"
        className="nav__link"
        style={{
          textDecoration: 'none',
          color: 'var(--theme-elevation-500)',
          padding: '0.5rem 0',
          display: 'block',
        }}
      >
        <span className="nav__label">Inventory Alerts</span>
      </Link>
    </div>
  )
}

export default InventoryAlertsLink
