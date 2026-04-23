import React from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TOOLS = [
  {
    label: 'Accounting',
    description: 'Revenue trends, order analytics, customer metrics.',
    href: '/management/accounting',
  },
  {
    label: 'Inventory Alerts',
    description: 'Low-stock and out-of-stock SKU overview.',
    href: '/management/inventory-alerts',
  },
  {
    label: 'Bulk Orders',
    description: 'Select and update multiple order statuses at once.',
    href: '/management/bulk-orders',
  },
  {
    label: 'Chat Dashboard',
    description: 'Live chat conversations and admin replies.',
    href: '/management/chat-dashboard',
  },
  {
    label: 'Zalo Sender',
    description: 'Send ZNS templates to customers via Zalo.',
    href: '/management/zalo-sender',
  },
]

export default function ManagementIndex() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
        Management Dashboard
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Select a tool to get started.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            style={{
              display: 'block',
              padding: 20,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              textDecoration: 'none',
              color: '#111827',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{tool.label}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{tool.description}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
