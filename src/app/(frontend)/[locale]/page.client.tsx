'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { Carousel } from '@/components/ecommerce/Carousel'
import { TakeActionHero } from '@/components/ecommerce/TakeActionHero'
import { FeaturedProducts } from '@/components/ecommerce/FeaturedProducts'
import { Categories } from '@/components/ecommerce/Categories'
import { ExploreMore } from '@/components/ecommerce/ExploreMore'
import { VirtualTryOnDemo } from '@/components/ecommerce/VirtualTryOnDemo'
import { BrandStory } from '@/components/ecommerce/BrandStory'
import { Newsletter } from '@/components/ecommerce/Newsletter'
import { RecentlyViewed } from '@/components/ecommerce/RecentlyViewed'
import dynamic from 'next/dynamic'

const ProductModal = dynamic(
  () => import('@/components/ecommerce/ProductModal').then((mod) => mod.ProductModal),
  { ssr: false },
)
import { AlternatingSection } from '@/components/layout/AlternatingSection'
import type { ProductForFrontend } from '@/utilities/getProducts'

interface QuickFilter {
  id: string
  label: string
  filterType: 'all' | 'category' | 'tag'
  categoryId?: number
  tagFilter?: 'sale' | 'new' | 'bestseller' | 'hot'
}

interface FeatureHighlight {
  title: string
  description: string
  icon: string
}

interface HomePageClientProps {
  featuredProducts?: ProductForFrontend[]
  carouselSlides?: any[]
  featuredCategories?: any[]
  activityCategories?: any[]
  quickFilters?: QuickFilter[]
  featureHighlights?: FeatureHighlight[]
}

export default function HomePageClient({
  featuredProducts,
  carouselSlides,
  featuredCategories,
  activityCategories,
  quickFilters,
  featureHighlights,
}: HomePageClientProps) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
  }

  const handleViewAll = () => {
    router.push('/products')
  }

  return (
    <>
      {/* Carousel - no alternating, inherits global theme */}
      <Carousel slides={carouselSlides} />

      {/* TakeActionHero at index 0 = same theme as header */}
      <AlternatingSection index={0}>
        <TakeActionHero />
      </AlternatingSection>

      <AlternatingSection index={1}>
        <FeaturedProducts
          products={featuredProducts}
          quickFilters={quickFilters}
          onProductClick={handleProductClick}
          onViewAll={handleViewAll}
        />
      </AlternatingSection>

      {/* Shop-by-activity. Renders nothing (zero height) until the
          Homepage global has activity categories configured, which
          temporarily collapses the dark/light rhythm — that's expected
          and goes away once the admin adds data. */}
      <AlternatingSection index={2}>
        <Categories categories={activityCategories} />
      </AlternatingSection>

      <AlternatingSection index={3}>
        <ExploreMore categories={featuredCategories} highlights={featureHighlights} />
      </AlternatingSection>

      <AlternatingSection index={4}>
        <VirtualTryOnDemo />
      </AlternatingSection>

      <AlternatingSection index={5}>
        <BrandStory />
      </AlternatingSection>

      {/* RecentlyViewed alternates naturally with its index. The old
          "Popular Products" carousel has been dropped per product
          direction. */}
      <AlternatingSection index={6}>
        <section className="py-20 bg-transparent text-foreground">
          <div className="container mx-auto px-6">
            <RecentlyViewed />
          </div>
        </section>
      </AlternatingSection>

      <AlternatingSection index={7}>
        <Newsletter />
      </AlternatingSection>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}
