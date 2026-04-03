'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?where[read][equals]=false&limit=0&depth=0', {
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      setUnreadCount(data.totalDocs ?? 0)
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [fetchUnread])

  return (
    <div className="nav-group">
      <Link
        href="/admin/collections/notifications"
        className="nav__link"
        style={{
          textDecoration: 'none',
          color: 'var(--theme-elevation-500)',
          padding: '0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span className="nav__label">Notifications</span>
        {unreadCount > 0 && (
          <span
            style={{
              background: '#ef4444',
              color: '#fff',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '18px',
              height: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </div>
  )
}

export default NotificationBell
