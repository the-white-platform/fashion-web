import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Product } from '@/payload-types'

type SizeEntry = {
  product: Product
  variantColor: string
  size: string
  stock: number
  threshold: number
}

const InventoryAlerts = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 10000,
    pagination: false,
    depth: 0,
  })

  const outOfStock: SizeEntry[] = []
  const lowStock: SizeEntry[] = []
  let totalSKUs = 0
  let healthyCount = 0

  for (const product of products) {
    for (const variant of product.colorVariants ?? []) {
      for (const inv of variant.sizeInventory ?? []) {
        totalSKUs++
        const stock = inv.stock ?? 0
        const threshold = inv.lowStockThreshold ?? 5
        const color = variant.color ?? ''
        const size = inv.size ?? ''

        if (stock === 0) {
          outOfStock.push({
            product: product as Product,
            variantColor: color,
            size,
            stock,
            threshold,
          })
        } else if (stock <= threshold) {
          lowStock.push({
            product: product as Product,
            variantColor: color,
            size,
            stock,
            threshold,
          })
        } else {
          healthyCount++
        }
      }
    }
  }

  return (
    <div className="gutter--left gutter--right py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Inventory Alerts</h1>
        <p className="text-gray-500">Overview of stock levels across all products.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total SKUs</h3>
          <p className="text-3xl font-bold">{totalSKUs}</p>
        </div>
        <div className="p-6 border border-green-200 rounded-lg bg-green-50 shadow-sm">
          <h3 className="text-sm font-medium text-green-700 mb-2">Healthy</h3>
          <p className="text-3xl font-bold text-green-800">{healthyCount}</p>
        </div>
        <div className="p-6 border border-yellow-200 rounded-lg bg-yellow-50 shadow-sm">
          <h3 className="text-sm font-medium text-yellow-700 mb-2">Low Stock</h3>
          <p className="text-3xl font-bold text-yellow-800">{lowStock.length}</p>
        </div>
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 shadow-sm">
          <h3 className="text-sm font-medium text-red-700 mb-2">Out of Stock</h3>
          <p className="text-3xl font-bold text-red-800">{outOfStock.length}</p>
        </div>
      </div>

      {outOfStock.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-red-700">Out of Stock</h2>
          <div className="border border-red-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-red-100">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Color</th>
                  <th className="p-4 font-medium">Size</th>
                  <th className="p-4 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {outOfStock.map((entry, i) => (
                  <tr
                    key={i}
                    className="border-t border-red-100 hover:bg-red-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <a
                        href={`/admin/collections/products/${entry.product.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {typeof entry.product.name === 'string'
                          ? entry.product.name
                          : ((entry.product.name as Record<string, string>)?.vi ??
                            entry.product.id)}
                      </a>
                    </td>
                    <td className="p-4">{entry.variantColor}</td>
                    <td className="p-4">{entry.size}</td>
                    <td className="p-4 font-medium text-red-700">{entry.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-yellow-700">Low Stock</h2>
          <div className="border border-yellow-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Color</th>
                  <th className="p-4 font-medium">Size</th>
                  <th className="p-4 font-medium">Current Stock</th>
                  <th className="p-4 font-medium">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((entry, i) => (
                  <tr
                    key={i}
                    className="border-t border-yellow-100 hover:bg-yellow-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <a
                        href={`/admin/collections/products/${entry.product.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {typeof entry.product.name === 'string'
                          ? entry.product.name
                          : ((entry.product.name as Record<string, string>)?.vi ??
                            entry.product.id)}
                      </a>
                    </td>
                    <td className="p-4">{entry.variantColor}</td>
                    <td className="p-4">{entry.size}</td>
                    <td className="p-4 font-medium text-yellow-700">{entry.stock}</td>
                    <td className="p-4 text-muted-foreground">{entry.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outOfStock.length === 0 && lowStock.length === 0 && (
        <div className="p-8 border border-green-200 rounded-lg bg-green-50 text-center">
          <p className="text-green-700 font-medium">All products are well-stocked.</p>
        </div>
      )}
    </div>
  )
}

export default InventoryAlerts
