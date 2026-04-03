'use client'

import React, { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Preset = 'today' | 'this-week' | 'this-month' | 'this-quarter' | 'this-year' | 'custom'

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getPresetRange(preset: Preset): { from: string; to: string } | null {
  const now = new Date()
  const today = formatDate(now)

  if (preset === 'today') {
    return { from: today, to: today }
  }

  if (preset === 'this-week') {
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday start
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    return { from: formatDate(monday), to: today }
  }

  if (preset === 'this-month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: formatDate(firstDay), to: today }
  }

  if (preset === 'this-quarter') {
    const quarter = Math.floor(now.getMonth() / 3)
    const firstDay = new Date(now.getFullYear(), quarter * 3, 1)
    return { from: formatDate(firstDay), to: today }
  }

  if (preset === 'this-year') {
    const firstDay = new Date(now.getFullYear(), 0, 1)
    return { from: formatDate(firstDay), to: today }
  }

  return null
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'this-week', label: 'Tuần này' },
  { key: 'this-month', label: 'Tháng này' },
  { key: 'this-quarter', label: 'Quý này' },
  { key: 'this-year', label: 'Năm này' },
  { key: 'custom', label: 'Tùy chọn' },
]

interface DateRangeFilterProps {
  from?: string
  to?: string
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ from, to }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigate = useCallback(
    (newFrom: string | null, newTo: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newFrom) {
        params.set('from', newFrom)
      } else {
        params.delete('from')
      }
      if (newTo) {
        params.set('to', newTo)
      } else {
        params.delete('to')
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handlePreset = (preset: Preset) => {
    if (preset === 'custom') return
    const range = getPresetRange(preset)
    if (range) {
      navigate(range.from, range.to)
    }
  }

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate(e.target.value || null, to ?? null)
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate(from ?? null, e.target.value || null)
  }

  const handleClear = () => {
    navigate(null, null)
  }

  const isActive = !!from || !!to

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border rounded-lg bg-card shadow-sm mb-6">
      <span className="text-sm font-medium text-muted-foreground shrink-0">Lọc theo kỳ:</span>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.filter((p) => p.key !== 'custom').map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => handlePreset(preset.key)}
            className="px-3 py-1 text-xs font-medium rounded-md border transition-colors
              hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Tùy chọn:</span>
        <input
          type="date"
          value={from ?? ''}
          onChange={handleFromChange}
          className="px-2 py-1 text-xs border rounded-md bg-background focus:outline-none
            focus:ring-2 focus:ring-primary"
          aria-label="Từ ngày"
        />
        <span className="text-xs text-muted-foreground">→</span>
        <input
          type="date"
          value={to ?? ''}
          onChange={handleToChange}
          className="px-2 py-1 text-xs border rounded-md bg-background focus:outline-none
            focus:ring-2 focus:ring-primary"
          aria-label="Đến ngày"
        />
      </div>

      {isActive && (
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1 text-xs font-medium rounded-md border border-destructive
            text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Xóa lọc
        </button>
      )}

      {isActive && (
        <span className="text-xs text-muted-foreground">
          {from && to
            ? `${new Date(from).toLocaleDateString('vi-VN')} – ${new Date(to).toLocaleDateString('vi-VN')}`
            : from
              ? `Từ ${new Date(from).toLocaleDateString('vi-VN')}`
              : `Đến ${new Date(to!).toLocaleDateString('vi-VN')}`}
        </span>
      )}
    </div>
  )
}
