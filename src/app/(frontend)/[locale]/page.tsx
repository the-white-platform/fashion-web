import HomePageClient from './page.client'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Product, Category, Media } from '@/payload-types'

// During Docker build, database may not be available - make dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 600

interface FeaturedProduct {
  id: number
  name: string
  category: string
  categoryId?: number
  categoryIds?: number[]
  price: string
  priceNumber: number
  image: string
  tag: string
}

interface QuickFilter {
  id: string
  label: string
  filterType: 'all' | 'category' | 'tag'
  categoryId?: number
  tagFilter?: 'sale' | 'new' | 'bestseller'
}

// Always use the custom e-commerce home page
// The CMS home page is available via /home if needed
export default async function HomePage() {
  let featuredProducts: FeaturedProduct[] = []
  let carouselSlides: any[] = []
  let featuredCategories: any[] = []
  let activityCategories: any[] = []
  let quickFilters: QuickFilter[] = []

  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch featured products
    const result = await payload.find({
      collection: 'products',
      depth: 2,
      where: {
        featured: { equals: true },
      },
      limit: 8, // Increased limit to support filtering
    })

    featuredProducts = result.docs.map((product: Product) => {
      // Handle category as array or object
      const categories = Array.isArray(product.category)
        ? product.category
        : product.category
          ? [product.category]
          : []

      const primaryCategory = categories[0] as Category | undefined
      const categoryIds = categories.map((cat) => (cat as Category).id)

      const images = (product.images || []).map((img) => {
        const media = img as Media
        return media?.url || '/assets/placeholder.jpg'
      })

      const formatPrice = (price: number) =>
        new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(price) + '₫'

      return {
        id: product.id,
        name: product.name,
        category: primaryCategory?.title || 'Uncategorized',
        categoryId: primaryCategory?.id, // Keep for backward compatibility if needed
        categoryIds: categoryIds, // New field for multi-category filtering
        price: formatPrice(product.price),
        priceNumber: product.price,
        image: images[0] || '/assets/placeholder.jpg',
        tag: product.tag || '',
      }
    })

    // Fetch carousel slides, activity categories, and quick filters from homepage global
    const homepage = await payload.findGlobal({
      slug: 'homepage',
      depth: 2, // Populate relationships
    })

    carouselSlides = homepage?.carouselSlides || []

    // Process quick filters from CMS
    const cmsQuickFilters = (homepage?.quickFilters || []) as any[]
    quickFilters = cmsQuickFilters.map((filter: any, index: number) => ({
      id: `filter-${index}`,
      label: filter.label,
      filterType: filter.filterType || 'all',
      categoryId: typeof filter.category === 'object' ? filter.category?.id : filter.category,
      tagFilter: filter.tagFilter,
    }))

    // If no quick filters configured, use defaults
    if (quickFilters.length === 0) {
      quickFilters = [{ id: 'all', label: 'Tất Cả', filterType: 'all' }]
    }

    // Fetch top 3 categories for ExploreMore section
    // Prioritize: Áo Thể Thao, Quần Dài, Giày Thể Thao
    const categoryNames = ['Áo Thể Thao', 'Quần Dài', 'Giày Thể Thao']
    const categoriesResult = await payload.find({
      collection: 'categories',
      where: {
        title: { in: categoryNames },
      },
      limit: 3,
    })

    featuredCategories = categoriesResult.docs.map((cat: Category) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-'),
    }))

    // Fetch activity categories for Shop By Activity section (from homepage global)
    const configuredActivityCategories = (homepage?.activityCategories || []) as Category[]

    // Get product counts for each activity category
    if (configuredActivityCategories.length > 0) {
      activityCategories = await Promise.all(
        configuredActivityCategories.map(async (cat: Category) => {
          const productCount = await payload.count({
            collection: 'products',
            where: {
              category: { equals: cat.id },
            },
          })

          return {
            id: cat.id,
            title: cat.title,
            slug: cat.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/Đ/g, 'D')
              .replace(/[^a-z0-9]+/g, '-'),
            productCount: productCount.totalDocs,
          }
        }),
      )
    }
  } catch (error) {
    console.warn('Failed to fetch data:', error)
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
