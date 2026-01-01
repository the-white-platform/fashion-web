import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import ProductsPageClient from './page.client'
import type { ProductForFrontend, CategoryForFrontend } from '@/utilities/getProducts'
import type { Product, Category, Media } from '@/payload-types'

// During Docker build, database may not be available - make dynamic to avoid build failures
export const dynamic = 'force-dynamic'
export const revalidate = 600

/**
 * Transform a Product from Payload to a frontend-friendly format
 */
function transformProduct(product: Product): ProductForFrontend {
  // Get category info
  const rawCategories = product.category
  const categoriesList = Array.isArray(rawCategories)
    ? rawCategories
    : rawCategories
      ? [rawCategories]
      : []
  const categoriesData = categoriesList.map((c) => c as Category)

  // Use first category as primary for display/compat
  const primaryCategory = categoriesData[0]
  const categoryName = primaryCategory?.title || 'Uncategorized'
  const categorySlug = categoryName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')

  // Get all category names
  const categories = categoriesData.map((c) => c.title)

  // Format price
  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
      }).format(price) + '₫'
    )
  }

  // Get images
  const images = (product.images || []).map((img) => {
    const media = img as Media
    return media?.url || '/assets/placeholder.jpg'
  })

  // Get description as plain text (if richText)
  let description = ''
  if (product.description?.root?.children) {
    description = product.description.root.children.map((child: any) => child.text || '').join(' ')
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug || String(product.id),
    category: categoryName,
    categories,
    categorySlug,
    price: formatPrice(product.price),
    priceNumber: product.price,
    originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : undefined,
    originalPriceNumber: product.originalPrice || undefined,
    image: images[0] || '/assets/placeholder.jpg',
    images,
    colors: (product.colors || []).map((c) => ({ name: c.name, hex: c.hex })),
    sizes: product.sizes || [],
    tag: product.tag || '',
    inStock: product.inStock ?? true,
    featured: product.featured ?? false,
    description,
    features: (product.features || []).map((f) => f.feature),
  }
}

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
