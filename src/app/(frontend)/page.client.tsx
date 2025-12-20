'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Carousel } from '@/components/ecommerce/Carousel'
import { TakeActionHero } from '@/components/ecommerce/TakeActionHero'
import { FeaturedProducts } from '@/components/ecommerce/FeaturedProducts'
import { Categories } from '@/components/ecommerce/Categories'
import { ProductFilter } from '@/components/ecommerce/ProductFilter'
import { ExploreMore } from '@/components/ecommerce/ExploreMore'
import { VirtualTryOnDemo } from '@/components/ecommerce/VirtualTryOnDemo'
import { BrandStory } from '@/components/ecommerce/BrandStory'
import { Newsletter } from '@/components/ecommerce/Newsletter'
import { ProductModal } from '@/components/ecommerce/ProductModal'

export default function HomePageClient() {
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
      <Carousel />
      <TakeActionHero />
      <ProductFilter />
      <FeaturedProducts onProductClick={handleProductClick} onViewAll={handleViewAll} />
      <Categories />
      <ExploreMore />
      <VirtualTryOnDemo />
      <BrandStory />
      <Newsletter />

      {/* Product Modal */}
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
