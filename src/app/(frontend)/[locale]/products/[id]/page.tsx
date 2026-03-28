import type { Metadata } from 'next/types'
import { notFound } from 'next/navigation'
import { getCachedProductBySlug, getCachedProducts } from '@/utilities/getProducts'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import ProductDetailClient from './page.client'

interface ProductDetailPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params
  const product = await getCachedProductBySlug(id, locale)()

  if (!product) return { title: 'Product Not Found | THE WHITE' }

  return {
    title: `${product.name} | THE WHITE`,
    description: product.description || `${product.name} - ${product.category} | THE WHITE`,
    openGraph: mergeOpenGraph({
      title: `${product.name} | THE WHITE`,
      description: product.description || `${product.name} - ${product.category}`,
      images: product.image ? [{ url: product.image }] : undefined,
    }),
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id, locale } = await params

  // Fetch product data and all products from Payload CMS with locale
  const [product, allProductsResult] = await Promise.all([
    getCachedProductBySlug(id, locale)(),
    getCachedProducts({ locale })(),
  ])

  // If product not found, show 404
  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} allProducts={allProductsResult} />
}
