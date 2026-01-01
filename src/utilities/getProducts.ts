import type { Product, Category, Media } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export interface ProductForFrontend {
  id: number
  name: string
  slug: string
  category: string
  categories: string[]
  categorySlug: string
  price: string
  priceNumber: number
  originalPrice?: string
  originalPriceNumber?: number
  image: string
  images: string[]
  colors: { name: string; hex: string }[]
  sizes: string[]
  tag: string
  inStock: boolean
  featured: boolean
  description?: string
  features: string[]
}

export interface CategoryForFrontend {
  name: string
  slug: string
  count: number
}

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

/**
 * Fetch all products from Payload CMS
 */
async function getProducts(options?: {
  limit?: number
  featured?: boolean
  categorySlug?: string
}) {
  const payload = await getPayload({ config: configPromise })

  const where: any = {}

  if (options?.featured) {
    where.featured = { equals: true }
  }

  const products = await payload.find({
    collection: 'products',
    depth: 2,
    limit: options?.limit || 100,
    where: Object.keys(where).length > 0 ? where : undefined,
  })

  return products.docs.map(transformProduct)
}

/**
 * Fetch a single product by slug or ID
 */
async function getProductBySlug(slug: string) {
  const payload = await getPayload({ config: configPromise })

  // Try to find by slug first
  let result = await payload.find({
    collection: 'products',
    depth: 2,
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  })

  // If not found by slug, try by ID
  if (result.docs.length === 0) {
    const id = parseInt(slug)
    if (!isNaN(id)) {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id,
          depth: 2,
        })
        if (product) {
          return transformProduct(product)
        }
      } catch {
        // Product not found by ID
      }
    }
    return null
  }

  return transformProduct(result.docs[0])
}

/**
 * Fetch categories with product counts
 */
async function getCategories(): Promise<CategoryForFrontend[]> {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
  })

  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.docs.map(async (cat) => {
      const products = await payload.find({
        collection: 'products',
        depth: 0,
        where: {
          category: { equals: cat.id },
        },
        limit: 0, // Just get count
      })

      return {
        name: cat.title,
        slug: cat.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]+/g, '-'),
        count: products.totalDocs,
      }
    }),
  )

  return categoriesWithCounts
}

/**
 * Cached version of getProducts
 */
export const getCachedProducts = (options?: { limit?: number; featured?: boolean }) =>
  unstable_cache(async () => getProducts(options), ['products', JSON.stringify(options)], {
    tags: ['products'],
    revalidate: 600, // 10 minutes
  })

/**
 * Cached version of getProductBySlug
 */
export const getCachedProductBySlug = (slug: string) =>
  unstable_cache(async () => getProductBySlug(slug), ['product', slug], {
    tags: [`product_${slug}`],
    revalidate: 600,
  })

/**
 * Cached version of getCategories
 */
export const getCachedCategories = () =>
  unstable_cache(async () => getCategories(), ['categories'], {
    tags: ['categories'],
    revalidate: 600,
  })

// Export non-cached versions for direct use
export { getProducts, getProductBySlug, getCategories }
