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
import { ProductModal } from '@/components/ecommerce/ProductModal'
import { AlternatingSection } from '@/components/AlternatingSection'

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

interface HomePageClientProps {
  featuredProducts?: FeaturedProduct[]
  carouselSlides?: any[]
  featuredCategories?: any[]
  activityCategories?: any[]
  quickFilters?: QuickFilter[]
}

export default function HomePageClient({
  featuredProducts,
  carouselSlides,
  featuredCategories,
  activityCategories,
  quickFilters,
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

      <AlternatingSection index={2}>
        <Categories categories={activityCategories} />
      </AlternatingSection>

      <AlternatingSection index={3}>
        <ExploreMore categories={featuredCategories} />
      </AlternatingSection>

      <AlternatingSection index={4}>
        <VirtualTryOnDemo />
      </AlternatingSection>

      <AlternatingSection index={5}>
        <BrandStory />
      </AlternatingSection>

      <AlternatingSection index={6}>
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
