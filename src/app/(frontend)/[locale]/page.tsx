import HomePageClient from './page.client'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Product, Category } from '@/payload-types'
import { slugify } from '@/utilities/slugify'
import { transformProduct, type ProductForFrontend } from '@/utilities/getProducts'

// Revalidate every 10 minutes
export const revalidate = 600

interface QuickFilter {
  id: string
  label: string
  filterType: 'all' | 'category' | 'tag'
  categoryId?: number
  tagFilter?: 'sale' | 'new' | 'bestseller'
}

// Always use the custom e-commerce home page
// The CMS home page is available via /home if needed
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  // Robustly handle params
  let locale = 'vi'
  try {
    const resolvedParams = await params
    locale = resolvedParams?.locale || 'vi'
  } catch (e) {
    console.error('Error resolving params:', e)
  }

  let featuredProducts: ProductForFrontend[] = []
  let carouselSlides: any[] = []
  let featuredCategories: any[] = []
  let activityCategories: any[] = []
  let quickFilters: QuickFilter[] = []

  try {
    // Only fetch if configPromise is available
    if (!configPromise) {
      throw new Error('Payload config promise is missing')
    }

    const payload = await getPayload({ config: configPromise })
    if (!payload) {
      throw new Error('Failed to initialize Payload')
    }

    // Fetch featured products
    const result = await payload.find({
      collection: 'products',
      depth: 2,
      locale: locale as 'vi' | 'en',
      where: {
        featured: { equals: true },
      },
      limit: 8, // Increased limit to support filtering
    })

    if (result?.docs) {
      featuredProducts = result.docs
        .filter((product): product is Product => Boolean(product))
        .map((product: Product) => transformProduct(product))
    }

    // Fetch carousel slides, activity categories, and quick filters from homepage global
    const homepage = await payload.findGlobal({
      slug: 'homepage',
      depth: 2, // Populate relationships
      locale: locale as 'vi' | 'en',
    })

    if (homepage) {
      carouselSlides = homepage.carouselSlides || []

      // Process quick filters from CMS
      const cmsQuickFilters = (homepage.quickFilters || []) as any[]
      quickFilters = cmsQuickFilters
        .map((filter: any, index: number) => {
          if (!filter) return null
          return {
            id: `filter-${index}`,
            label: filter.label || 'Filter',
            filterType: filter.filterType || 'all',
            categoryId: typeof filter.category === 'object' ? filter.category?.id : filter.category,
            tagFilter: filter.tagFilter,
          }
        })
        .filter(Boolean) as QuickFilter[]

      // If no quick filters configured, use defaults
      if (quickFilters.length === 0) {
        quickFilters = [{ id: 'all', label: 'Tất Cả', filterType: 'all' }]
      }

      // Fetch activity categories for Shop By Activity section (from homepage global)
      const configuredActivityCategories = (homepage.activityCategories || []) as (
        | number
        | Category
      )[]

      // Get product counts for each activity category
      if (configuredActivityCategories.length > 0) {
        activityCategories = await Promise.all(
          configuredActivityCategories.map(async (catItem: number | Category) => {
            if (!catItem) return null

            const catId = typeof catItem === 'object' ? catItem.id : catItem
            const catTitle = typeof catItem === 'object' ? catItem.title : `Category ${catId}`

            try {
              const productCount = await payload.count({
                collection: 'products',
                where: {
                  category: { equals: catId },
                },
              })

              return {
                id: catId,
                title: catTitle,
                slug: slugify(catTitle),
                productCount: productCount.totalDocs,
              }
            } catch (e) {
              return null
            }
          }),
        )
        activityCategories = activityCategories.filter(Boolean)
      }
    }

    // Top 3 non-empty categories by product count for the ExploreMore section.
    // Was previously hardcoded to ['Áo Thể Thao', 'Quần Dài', 'Giày Thể Thao'],
    // which surfaced an empty Giày Thể Thao tile.
    const allCategoriesResult = await payload.find({
      collection: 'categories',
      locale: locale as 'vi' | 'en',
      limit: 100,
      depth: 0,
    })

    const counts = await Promise.all(
      (allCategoriesResult?.docs ?? []).map(async (cat: Category) => {
        const { totalDocs } = await payload.count({
          collection: 'products',
          where: { category: { equals: cat.id } },
        })
        return { cat, count: totalDocs }
      }),
    )

    featuredCategories = counts
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ cat }) => ({ id: cat.id, title: cat.title, slug: slugify(cat.title) }))
  } catch (error: any) {
    console.warn('Failed to fetch data:', error?.message || error || 'Unknown error')
  }

  return (
    <HomePageClient
      featuredProducts={featuredProducts}
      carouselSlides={carouselSlides}
      featuredCategories={featuredCategories}
      activityCategories={activityCategories}
      quickFilters={quickFilters}
    />
  )
}

export const metadata: Metadata = {
  title: 'TheWhite - Thời Trang Thể Thao Hiện Đại',
  description: 'Khám phá bộ sưu tập thời trang thể thao cao cấp từ TheWhite',
}
