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
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  // Robustly handle params
  let locale = 'vi'
  try {
    const resolvedParams = await params
    locale = resolvedParams?.locale || 'vi'
  } catch (e) {
    console.error('Error resolving params:', e)
  }

  let featuredProducts: FeaturedProduct[] = []
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
        .map((product: Product) => {
          if (!product) return null

          // Handle category as array or object
          const categories = Array.isArray(product.category)
            ? product.category
            : product.category
              ? [product.category]
              : []

          const primaryCategory = categories[0] as Category | undefined
          const categoryIds = categories
            .map((cat) => (typeof cat === 'object' ? cat?.id : cat))
            .filter(Boolean) as number[]

          // Get image from first color variant
          let imageUrl = '/assets/placeholder.jpg'
          if (product.colorVariants && product.colorVariants.length > 0) {
            const firstVariant = product.colorVariants[0]
            if (firstVariant?.images && firstVariant.images.length > 0) {
              const firstImage = firstVariant.images[0]
              if (typeof firstImage === 'object' && firstImage !== null) {
                imageUrl = (firstImage as Media).url || '/assets/placeholder.jpg'
              }
            }
          }

          const formatPrice = (price: number) => {
            if (typeof price !== 'number') return '0₫'
            return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(price) + '₫'
          }

          return {
            id: product.id,
            name: product.name || 'Sản phẩm không tên',
            category: primaryCategory?.title || 'Chưa phân loại',
            categoryId: primaryCategory?.id,
            categoryIds: categoryIds,
            price: formatPrice(product.price),
            priceNumber: product.price || 0,
            image: imageUrl,
            tag: product.tag || '',
          }
        })
        .filter(Boolean) as FeaturedProduct[]
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
                slug: catTitle
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/đ/g, 'd')
                  .replace(/Đ/g, 'D')
                  .replace(/[^a-z0-9]+/g, '-'),
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

    // Fetch top 3 categories for ExploreMore section
    // Prioritize: Áo Thể Thao, Quần Dài, Giày Thể Thao
    const categoryNames = ['Áo Thể Thao', 'Quần Dài', 'Giày Thể Thao']
    const categoriesResult = await payload.find({
      collection: 'categories',
      locale: locale as 'vi' | 'en',
      where: {
        title: { in: categoryNames },
      },
      limit: 3,
    })

    if (categoriesResult?.docs) {
      featuredCategories = categoriesResult.docs
        .map((cat: Category) => {
          if (!cat) return null
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
          }
        })
        .filter(Boolean)
    }
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
