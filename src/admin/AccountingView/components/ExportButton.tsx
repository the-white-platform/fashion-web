'use client'

import React, { useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type ExportType = 'orders' | 'revenue-by-category' | 'top-products' | 'stock-movements'

const EXPORT_OPTIONS: { type: ExportType; label: string }[] = [
  { type: 'orders', label: 'Đơn hàng' },
  { type: 'revenue-by-category', label: 'Doanh thu theo danh mục' },
  { type: 'top-products', label: 'Top sản phẩm' },
  { type: 'stock-movements', label: 'Biến động kho' },
]

export const ExportButton: React.FC = () => {
  const [open, setOpen] = useState(false)
  const searchParams = useSearchParams()
  const menuRef = useRef<HTMLDivElement>(null)

  const handleExport = (type: ExportType) => {
    const params = new URLSearchParams({ type })
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (from) params.set('from', from)
    if (to) params.set('to', to)

    const a = document.createElement('a')
    a.href = `/api/export-csv?${params.toString()}`
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setOpen(false)
  }

  // Close on click-away
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg
          bg-card hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Xuất CSV
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border bg-card shadow-md
            overflow-hidden"
        >
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => handleExport(option.type)}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
