import type { Product, Category, Media, ProductTag } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { slugify } from '@/utilities/slugify'
import { formatPrice } from '@/utilities/formatPrice'
import type { SizeChartData } from '@/components/ecommerce/SizeChartModal'

type Locale = 'vi' | 'en'

/**
 * Resolve the tag display info for a product.
 *
 * `product.tag` is a relationship to the `product-tags` collection. At
 * depth >= 1 Payload populates it as a full ProductTag document whose
 * `label` field is already localized to the requested locale. At depth 0
 * it comes back as just an integer id — in that case we emit empty
 * strings (the caller normally passes depth >= 1).
 */
function resolveTag(raw: Product['tag']): { code: string; label: string } {
  if (!raw || typeof raw !== 'object') return { code: '', label: '' }
  const tag = raw as ProductTag
  const label = typeof tag.label === 'string' ? tag.label : ''
  return { code: tag.code ?? '', label: label || (tag.code ?? '') }
}

/**
 * Pick a reasonably-sized URL off a Payload Media doc.
 *
 * Media originals on prod are 10–21 MB PNGs (hi-res shoot output). The
 * Next.js Image optimizer was fetching the full original to generate
 * every srcset variant, so a single product card wedged Cloud Run for
 * ~30 s on cold hit and ~4 s warm. Payload's upload config already
 * generates a pyramid (thumbnail / square / small / medium / large /
 * xlarge) on GCS; prefer `medium` (900×900, ~150 KB) as the seed URL
 * so downstream optimization starts from something small.
 *
 * Preference order: medium → small → square → thumbnail → large → xlarge → original.
 * Falls back to a placeholder when nothing is available.
 */
function pickMediaUrl(media: Media | null | undefined): string {
  if (!media) return '/assets/placeholder.jpg'
  const sizes = (media as unknown as { sizes?: Record<string, { url?: string | null } | null> })
    .sizes
  if (sizes) {
    const order = ['medium', 'small', 'square', 'thumbnail', 'large', 'xlarge'] as const
    for (const key of order) {
      const url = sizes[key]?.url
      if (url) return url
    }
  }
  return media.url || '/assets/placeholder.jpg'
}

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
  /**
   * Display-ready tag label for the active locale. Resolved from the
   * `label: { vi, en }` map on the `tag` select options in
   * `src/collections/Products.ts` — the storefront renders this, not the
   * raw `tag` value. Admins add new tags in one place (the collection
   * config) and the translated badge appears automatically.
   */
  tagLabel: string
  inStock: boolean
  featured: boolean
  description?: string
  features: string[]
  averageRating?: number
  reviewCount?: number
  sizeChart?: SizeChartData | null
}

export interface CategoryForFrontend {
  name: string
  slug: string
  count: number
}

/**
 * Transform a Product from Payload to a frontend-friendly format.
 *
 * `locale` controls the display-only `tagLabel` field; all other string
 * fields (name, description, colorVariants[].color, …) come back already
 * localized from Payload via the `locale` arg passed to `payload.find`.
 */
export function transformProduct(product: Product, locale: Locale = 'vi'): ProductForFrontend {
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
        return pickMediaUrl(media)
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
      return pickMediaUrl(media)
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

  // Flatten the Lexical richtext description into clean paragraph text.
  // Within a block (paragraph/heading/etc.) inline text nodes are
  // concatenated as-is and any stray `\n` are collapsed to single spaces
  // so the sentence reads as prose. Blocks are separated by a single
  // blank line so the storefront can render them as distinct paragraphs
  // via `whitespace-pre-line`. Consecutive empty blocks are squashed.
  const extractInline = (node: any): string => {
    if (!node) return ''
    if (typeof node.text === 'string') return node.text
    if (Array.isArray(node.children)) return node.children.map(extractInline).join('')
    return ''
  }
  let description = ''
  if (product.description?.root?.children) {
    const paragraphs: string[] = []
    for (const child of product.description.root.children) {
      const text = extractInline(child)
        .replace(/\s*\n+\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (text) paragraphs.push(text)
    }
    description = paragraphs.join('\n\n')
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
    ...(() => {
      const { code, label } = resolveTag(product.tag)
      return { tag: code, tagLabel: label }
    })(),
    inStock,
    featured: product.featured ?? false,
    description,
    features: (product.features || []).map((f) => f.feature),
    averageRating: (product as any).averageRating ?? 0,
    reviewCount: (product as any).reviewCount ?? 0,
    sizeChart: (product as any).sizeChart ?? null,
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

  const locale: Locale = (options?.locale as Locale) || 'vi'
  const products = await payload.find({
    collection: 'products',
    depth: 2,
    limit: options?.limit || 100,
    locale,
    where: Object.keys(where).length > 0 ? where : undefined,
  })

  return products.docs.map((p) => transformProduct(p, locale))
}

/**
 * Fetch a single product by slug or ID
 */
async function getProductBySlug(slug: string, locale?: string) {
  const payload = await getPayload({ config: configPromise })
  const activeLocale: Locale = (locale as Locale) || 'vi'

  // Try to find by slug first
  let result = await payload.find({
    collection: 'products',
    depth: 2,
    locale: activeLocale,
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
          locale: activeLocale,
        })
        if (product) {
          return transformProduct(product, activeLocale)
        }
      } catch {
        // Product not found by ID
      }
    }
    return null
  }

  return transformProduct(result.docs[0], activeLocale)
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
