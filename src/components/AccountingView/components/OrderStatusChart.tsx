'use client'

import React from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface OrderStatusChartProps {
  data: {
    name: string
    value: number
  }[]
}

const COLORS = {
  pending: '#fbbf24', // yellow-400
  processing: '#3b82f6', // blue-500
  shipping: '#8b5cf6', // violet-500
  delivered: '#22c55e', // green-500
  cancelled: '#ef4444', // red-500
  refunded: '#f97316', // orange-500
  failed: '#64748b', // slate-500
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => {
              const color = COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'
              return <Cell key={`cell-${index}`} fill={color} />
            })}
          </Pie>
          <Tooltip formatter={(value: number) => [value, 'Đơn hàng']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
