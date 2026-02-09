import type { Product, Category, Media } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { slugify } from '@/utilities/slugify'
import { formatPrice } from '@/utilities/formatPrice'

export interface ColorVariant {
  color: string
  colorHex: string
  sizes: string[]
  images: string[]
  inStock: boolean
}

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
  image: string // Default/first variant's first image
  images: string[] // Default/first variant's images
  colorVariants: ColorVariant[]
  colors: { name: string; hex: string }[] // Aggregated from variants
  sizes: string[] // Aggregated from all variants
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
export function transformProduct(product: Product): ProductForFrontend {
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
  const categorySlug = slugify(categoryName)

  // Get all category names
  const categories = categoriesData.map((c) => c.title)

  // Format price
  // Transform color variants
  const colorVariants: ColorVariant[] = ((product as any).colorVariants || []).map(
    (variant: any) => {
      const variantImages = (variant.images || []).map((img: any) => {
        const media = img as Media
        return media?.url || '/assets/placeholder.jpg'
      })

      // Get sizes from sizeInventory (new structure) or fallback to sizes array
      const sizesFromInventory = (variant.sizeInventory || [])
        .filter((si: any) => si?.stock > 0)
        .map((si: any) => si.size)

      const sizes = sizesFromInventory.length > 0 ? sizesFromInventory : variant.sizes || []

      // inStock is true if there's any item with stock > 0
      const variantInStock =
        variant.sizeInventory && variant.sizeInventory.length > 0
          ? variant.sizeInventory.some((si: any) => si.stock > 0)
          : (variant.inStock ?? true)

      return {
        color: variant.color || '',
        colorHex: variant.colorHex || '#000000',
        sizes: sizes,
        images: variantImages,
        inStock: variantInStock,
      }
    },
  )

  // Get default variant (first one) or fallback to old images field
  const defaultVariant = colorVariants[0]
  const defaultImages = defaultVariant?.images || []

  // Fallback: if no variants, use old images field
  if (!defaultVariant && (product as any).images) {
    const legacyImages = ((product as any).images || []).map((img: any) => {
      const media = img as Media
      return media?.url || '/assets/placeholder.jpg'
    })
    defaultImages.push(...legacyImages)
  }

  // Aggregate all unique colors from variants
  const colors = colorVariants.map((v) => ({ name: v.color, hex: v.colorHex }))

  // Aggregate all unique sizes from all variants
  const allSizes = new Set<string>()
  colorVariants.forEach((v) => v.sizes.forEach((s) => allSizes.add(s)))

  // Fallback to top-level sizes if no variant sizes found
  if (allSizes.size === 0 && product.sizes) {
    product.sizes.forEach((s) => allSizes.add(s))
  }

  const sizes = Array.from(allSizes)

  // Check if any variant is in stock
  const inStock =
    colorVariants.length > 0 ? colorVariants.some((v) => v.inStock) : (product.inStock ?? true)

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
    image: defaultImages[0] || '/assets/placeholder.jpg',
    images: defaultImages,
    colorVariants,
    colors,
    sizes,
    tag: product.tag || '',
    inStock,
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
  locale?: string
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
    locale: (options?.locale as 'vi' | 'en') || 'vi',
    where: Object.keys(where).length > 0 ? where : undefined,
  })

  return products.docs.map(transformProduct)
}

/**
 * Fetch a single product by slug or ID
 */
async function getProductBySlug(slug: string, locale?: string) {
  const payload = await getPayload({ config: configPromise })

  // Try to find by slug first
  let result = await payload.find({
    collection: 'products',
    depth: 2,
    locale: (locale as 'vi' | 'en') || 'vi',
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
          locale: (locale as 'vi' | 'en') || 'vi',
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
async function getCategories(locale?: string): Promise<CategoryForFrontend[]> {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    locale: (locale as 'vi' | 'en') || 'vi',
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
        slug: slugify(cat.title),
        count: products.totalDocs,
      }
    }),
  )

  return categoriesWithCounts
}

/**
 * Cached version of getProducts
 */
export const getCachedProducts = (options?: {
  limit?: number
  featured?: boolean
  locale?: string
}) =>
  unstable_cache(async () => getProducts(options), ['products', JSON.stringify(options)], {
    tags: ['products'],
    revalidate: 600, // 10 minutes
  })

/**
 * Cached version of getProductBySlug
 */
export const getCachedProductBySlug = (slug: string, locale?: string) =>
  unstable_cache(async () => getProductBySlug(slug, locale), ['product', slug, locale || 'vi'], {
    tags: [`product_${slug}`],
    revalidate: 600,
  })

/**
 * Cached version of getCategories
 */
export const getCachedCategories = (locale?: string) =>
  unstable_cache(async () => getCategories(locale), ['categories', locale || 'vi'], {
    tags: ['categories'],
    revalidate: 600,
  })

// Export non-cached versions for direct use
export { getProducts, getProductBySlug, getCategories }
