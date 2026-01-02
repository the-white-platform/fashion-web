import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import ProductsPageClient from './page.client'
import type { ProductForFrontend, CategoryForFrontend } from '@/utilities/getProducts'
import { transformProduct } from '@/utilities/getProducts'

// During Docker build, database may not be available - make dynamic to avoid build failures
export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function ProductsPage() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all products
    const productsResult = await payload.find({
      collection: 'products',
      depth: 2,
      limit: 100,
    })

    // Fetch categories
    const categoriesResult = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
    })

    // Transform products
    const products = productsResult.docs.map(transformProduct)

    // Get unique colors from all products
    const allColors = products.flatMap((p) => p.colors)
    const uniqueColors = Array.from(new Map(allColors.map((c) => [c.hex, c])).values())

    // Get product counts per category
    const categoryCounts = new Map<string, number>()
    products.forEach((p) => {
      // Iterate over ALL categories a product belongs to
      p.categories.forEach((catName) => {
        const count = categoryCounts.get(catName) || 0
        categoryCounts.set(catName, count + 1)
      })
    })

    // Build categories with counts
    const categories: CategoryForFrontend[] = [
      { name: 'Tất Cả', slug: 'all', count: products.length },
      ...categoriesResult.docs
        .filter((cat) => categoryCounts.has(cat.title))
        .map((cat) => ({
          name: cat.title,
          slug: cat.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-'),
          count: categoryCounts.get(cat.title) || 0,
        })),
    ]

    return (
      <ProductsPageClient
        initialProducts={products}
        categories={categories}
        colors={uniqueColors}
      />
    )
  } catch (error) {
    console.warn('Failed to fetch products:', error)
    // Return client with empty data - it will show loading or fallback
    return (
      <ProductsPageClient
        initialProducts={[]}
        categories={[{ name: 'Tất Cả', slug: 'all', count: 0 }]}
        colors={[]}
      />
    )
  }
}

export function generateMetadata(): Metadata {
  return {
    title: 'Sản Phẩm | THE WHITE',
    description: 'Khám phá bộ sưu tập thời trang thể thao cao cấp của THE WHITE',
  }
}
