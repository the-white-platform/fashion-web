'use client'

import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface OrderVolumePoint {
  period: string
  orders: number
}

interface OrderVolumeTrendProps {
  data: OrderVolumePoint[]
}

export const OrderVolumeTrend: React.FC<OrderVolumeTrendProps> = ({ data }) => {
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
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="orderVolumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--theme-elevation-500)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--theme-elevation-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip formatter={(value: number) => [value, 'Đơn hàng']} />
          <Legend />
          <Area
            type="monotone"
            dataKey="orders"
            name="Đơn hàng"
            stroke="var(--theme-elevation-500)"
            strokeWidth={2}
            fill="url(#orderVolumeGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
