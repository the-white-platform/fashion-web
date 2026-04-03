import React from 'react'

export interface CustomerMetricsData {
  newCustomers: number
  returningCustomers: number
  repeatRate: number
  avgOrderValue: number
}

interface CustomerMetricsProps {
  data: CustomerMetricsData
}

export const CustomerMetrics: React.FC<CustomerMetricsProps> = ({ data }) => {
  const cards = [
    {
      label: 'Khách hàng mới',
      value: data.newCustomers.toLocaleString('vi-VN'),
      description: 'Lần đầu đặt hàng trong kỳ',
    },
    {
      label: 'Khách quay lại',
      value: data.returningCustomers.toLocaleString('vi-VN'),
      description: '2+ đơn hàng',
    },
    {
      label: 'Tỷ lệ quay lại',
      value: `${data.repeatRate.toFixed(1)}%`,
      description: 'Khách đặt lại đơn',
    },
    {
      label: 'Giá trị TB/đơn',
      value: `${data.avgOrderValue.toLocaleString('vi-VN')}₫`,
      description: 'Trung bình đơn hàng có phí',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="p-4 border rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
          <p className="text-2xl font-bold mb-0.5">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </div>
      ))}
    </div>
  )
}
