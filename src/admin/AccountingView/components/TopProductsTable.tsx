import React from 'react'

export interface TopProduct {
  rank: number
  productName: string
  category: string
  quantitySold: number
  revenue: number
}

interface TopProductsTableProps {
  products: TopProduct[]
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  if (products.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Không có dữ liệu</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="pb-3 pr-4 font-medium text-muted-foreground">#</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Sản phẩm</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Danh mục</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">SL bán</th>
            <th className="pb-3 font-medium text-muted-foreground text-right">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.rank}
              className="border-b last:border-0 hover:bg-muted/40 transition-colors"
            >
              <td className="py-3 pr-4 text-muted-foreground">{product.rank}</td>
              <td className="py-3 pr-4 font-medium">{product.productName}</td>
              <td className="py-3 pr-4 text-muted-foreground">{product.category}</td>
              <td className="py-3 pr-4 text-right">{product.quantitySold}</td>
              <td className="py-3 text-right font-medium">
                {product.revenue.toLocaleString('vi-VN')}₫
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
