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

  if (!product) return { title: 'Product Not Found | TheWhite' }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'
  const slug = product.slug || product.id
  const path = `/products/${slug}`

  return {
    title: `${product.name} | TheWhite`,
    description: product.description || `${product.name} - ${product.category} | TheWhite`,
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: {
        'vi-VN': `${baseUrl}/vi${path}`,
        'en-US': `${baseUrl}/en${path}`,
        'x-default': `${baseUrl}/vi${path}`,
      },
    },
    openGraph: mergeOpenGraph({
      title: `${product.name} | TheWhite`,
      description: product.description || `${product.name} - ${product.category}`,
      images: product.image ? [{ url: product.image }] : undefined,
      locale,
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

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'
  const productUrl = `${baseUrl}/${locale}/products/${product.slug || product.id}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image,
    sku: String(product.id),
    brand: {
      '@type': 'Brand',
      name: 'TheWhite',
    },
    offers: {
      '@type': 'Offer',
      price: product.priceNumber,
      priceCurrency: 'VND',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: productUrl,
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  const homeLabel = locale === 'vi' ? 'Trang chủ' : 'Home'
  const productsLabel = locale === 'vi' ? 'Sản phẩm' : 'Products'

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: homeLabel, item: `${baseUrl}/${locale}` },
      {
        '@type': 'ListItem',
        position: 2,
        name: productsLabel,
        item: `${baseUrl}/${locale}/products`,
      },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
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
