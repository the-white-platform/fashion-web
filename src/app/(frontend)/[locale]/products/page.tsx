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
  const allLabel = locale === 'en' ? 'All' : 'Tất Cả'

  let transformedProducts: ProductForFrontend[] = []
  let outCategories: CategoryForFrontend[] = [{ name: allLabel, slug: 'all', count: 0 }]
  let outColors: any[] = []

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
    transformedProducts = products

    // Get unique colors from all products
    const allColors = products.flatMap((p) => p.colors)
    outColors = Array.from(new Map(allColors.map((c) => [c.hex, c])).values())

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
    outCategories = [
      { name: allLabel, slug: 'all', count: products.length },
      ...categoriesResult.docs
        .filter((cat) => categoryCounts.has(cat.title))
        .map((cat) => ({
          name: cat.title,
          slug: slugify(cat.title),
          count: categoryCounts.get(cat.title) || 0,
        })),
    ]
  } catch (error) {
    console.warn('Failed to fetch products:', error)
    // Client page will show empty logic since products is []
  }

  return (
    <ProductsPageClient
      initialProducts={transformedProducts}
      categories={outCategories}
      colors={outColors}
    />
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Sản Phẩm | THE WHITE',
    description: 'Khám phá bộ sưu tập thời trang thể thao cao cấp của THE WHITE',
  }
}
