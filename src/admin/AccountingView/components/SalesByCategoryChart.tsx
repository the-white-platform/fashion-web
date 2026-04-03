'use client'

import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface CategorySalesPoint {
  category: string
  revenue: number
}

interface SalesByCategoryChartProps {
  data: CategorySalesPoint[]
}

export const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({ data }) => {
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
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
          />
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
          <Bar
            dataKey="revenue"
            name="Doanh thu"
            fill="var(--theme-elevation-500)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
