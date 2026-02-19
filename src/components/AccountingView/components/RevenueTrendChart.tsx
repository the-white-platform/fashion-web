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

interface RevenueTrendChartProps {
  data: {
    name: string
    revenue: number
  }[]
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('vi-VN')}₫`, 'Doanh thu']}
            labelStyle={{ color: '#000' }}
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
