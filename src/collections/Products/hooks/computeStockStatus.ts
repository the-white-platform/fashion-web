import type { CollectionBeforeChangeHook } from 'payload'

export const computeStockStatus: CollectionBeforeChangeHook = ({ data }) => {
  const variants = data.colorVariants as
    | Array<{
        sizeInventory?: Array<{ stock?: number; lowStockThreshold?: number }>
      }>
    | undefined

  if (!variants || variants.length === 0) {
    return data
  }

  const allSizes = variants.flatMap((v) => v.sizeInventory ?? [])

  if (allSizes.length === 0) {
    return data
  }

  const totalStock = allSizes.reduce((sum, s) => sum + (s.stock ?? 0), 0)

  let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'

  if (totalStock === 0) {
    stockStatus = 'out_of_stock'
  } else if (
    allSizes.some((s) => (s.stock ?? 0) > 0 && (s.stock ?? 0) <= (s.lowStockThreshold ?? 5))
  ) {
    stockStatus = 'low_stock'
  } else {
    stockStatus = 'in_stock'
  }

  return {
    ...data,
    stockStatus,
    inStock: stockStatus !== 'out_of_stock',
  }
}
