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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: 'THE WHITE',
    },
    offers: {
      '@type': 'Offer',
      price: product.priceNumber,
      priceCurrency: 'VND',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/products/${product.slug || product.id}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SERVER_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${process.env.NEXT_PUBLIC_SERVER_URL}/products`,
      },
      { '@type': 'ListItem', position: 3, name: product.name },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} allProducts={allProductsResult} />
    </>
  )
}
