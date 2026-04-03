'use client'

import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface RevenueTrendPoint {
  period: string
  revenue: number
}

interface RevenueTrendLineProps {
  data: RevenueTrendPoint[]
}

export const RevenueTrendLine: React.FC<RevenueTrendLineProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
        Không có dữ liệu
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('vi-VN')}₫`, 'Doanh thu']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke="var(--theme-elevation-500)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
