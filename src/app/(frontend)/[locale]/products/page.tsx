import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import ProductsPageClient from './page.client'
import type { ProductForFrontend, CategoryForFrontend } from '@/utilities/getProducts'
import { transformProduct } from '@/utilities/getProducts'
import { getTranslations } from 'next-intl/server'
import { slugify } from '@/utilities/slugify'

// Revalidate every 10 minutes
export const revalidate = 600

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('products')

  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all products with locale
    const productsResult = await payload.find({
      collection: 'products',
      depth: 2,
      limit: 100,
      locale: locale as 'vi' | 'en',
    })

    // Fetch categories with locale
    const categoriesResult = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      locale: locale as 'vi' | 'en',
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

    // Build categories with counts - use translated "All" label
    const allLabel = locale === 'en' ? 'All' : 'Tất Cả'
    const categories: CategoryForFrontend[] = [
      { name: allLabel, slug: 'all', count: products.length },
      ...categoriesResult.docs
        .filter((cat) => categoryCounts.has(cat.title))
        .map((cat) => ({
          name: cat.title,
          slug: slugify(cat.title),
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
    const allLabel = locale === 'en' ? 'All' : 'Tất Cả'
    // Return client with empty data - it will show loading or fallback
    return (
      <ProductsPageClient
        initialProducts={[]}
        categories={[{ name: allLabel, slug: 'all', count: 0 }]}
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
