import { notFound } from 'next/navigation'
import { getCachedProductBySlug, getCachedProducts } from '@/utilities/getProducts'
import ProductDetailClient from './page.client'

interface ProductDetailPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
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
