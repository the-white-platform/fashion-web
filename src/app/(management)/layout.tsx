import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const TOOLS = [
  { label: 'Accounting', href: '/management/accounting' },
  { label: 'Inventory Alerts', href: '/management/inventory-alerts' },
  { label: 'Bulk Orders', href: '/management/bulk-orders' },
  { label: 'Chat Dashboard', href: '/management/chat-dashboard' },
  { label: 'Zalo Sender', href: '/management/zalo-sender' },
]

const navLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '9px 16px',
  fontSize: 14,
  color: '#374151',
  textDecoration: 'none',
}

export default async function ManagementLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  const role = (user as { role?: string } | null)?.role
  if (!user || !['admin', 'manager'].includes(role ?? '')) {
    redirect('/admin')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 220,
          background: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <Link
            href="/management"
            style={{ fontWeight: 700, fontSize: 15, color: '#111827', textDecoration: 'none' }}
          >
            Management
          </Link>
        </div>
        <div style={{ flex: 1, padding: '8px 0' }}>
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} style={navLinkStyle}>
              {tool.label}
            </Link>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
          <Link href="/admin" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            ← Payload Admin
          </Link>
        </div>
      </nav>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header
          style={{
            height: 52,
            background: '#111827',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>THE WHITE — Management</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#d1d5db' }}>{user.email}</span>
            {/* Sign-out hits the Payload REST logout endpoint — not a Next.js page, so <a> is correct */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/users/logout"
              style={{
                fontSize: 13,
                color: '#d1d5db',
                textDecoration: 'none',
                padding: '4px 10px',
                border: '1px solid #4b5563',
                borderRadius: 4,
              }}
            >
              Sign out
            </a>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  )
}
