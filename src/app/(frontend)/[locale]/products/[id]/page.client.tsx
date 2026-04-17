'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  Sparkles,
  Plus,
  Minus,
  ArrowRightLeft,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext'
import { useCompare } from '@/contexts/CompareContext'
import { FeaturesBadges } from '@/components/shared/FeaturesBadges'
import { ProductCard } from '@/components/shared/ProductCard'
import { ImageZoom } from '@/components/ecommerce/ImageZoom'
import { ProductReviews } from '@/components/ecommerce/ProductReviews'
import { RecentlyViewed } from '@/components/ecommerce/RecentlyViewed'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

const VirtualTryOnModal = dynamic(
  () => import('@/components/ecommerce/VirtualTryOnModal').then((mod) => mod.VirtualTryOnModal),
  { ssr: false },
)
const SmartSizePicker = dynamic(
  () => import('@/components/ecommerce/SmartSizePicker').then((mod) => mod.SmartSizePicker),
  { ssr: false },
)
import { SizeChartModal } from '@/components/ecommerce/SizeChartModal'
import type { ProductForFrontend } from '@/utilities/getProducts'
import { getRelatedProducts } from '@/utilities/getRelatedProducts'
import { Link } from '@/i18n/Link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ProductDetailClientProps {
  product: ProductForFrontend
  allProducts: ProductForFrontend[]
}

export default function ProductDetailClient({ product, allProducts }: ProductDetailClientProps) {
  const router = useRouter()
  const { addToCart, setIsCartOpen } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { trackProduct } = useRecentlyViewed()

  // Track this product as recently viewed on mount
  useEffect(() => {
    trackProduct(product)
  }, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // State
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageDirection, setImageDirection] = useState(0)
  const [isTryOnOpen, setIsTryOnOpen] = useState(false)
  const [isSizePickerOpen, setIsSizePickerOpen] = useState(false)

  // Best-effort: map category Áo -> shirt, Quần -> pants. Falls through
  // to 'shirt' (safe default) for anything else.
  const sizePickerDefaultType = useMemo<'shirt' | 'pants'>(() => {
    const cat = (product.categories || [product.category] || []).join(' ').toLowerCase()
    if (cat.includes('quần')) return 'pants'
    return 'shirt'
  }, [product.categories, product.category])
  const [descExpanded, setDescExpanded] = useState(false)
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const tProducts = useTranslations('products')
  const tDetail = useTranslations('products.detail')

  // Get current variant
  const selectedVariant = product.colorVariants[selectedVariantIndex]
  const currentImages = selectedVariant?.images || product.images || []
  const currentSizes = useMemo(
    () => selectedVariant?.sizes || product.sizes || [],
    [selectedVariant?.sizes, product.sizes],
  )

  // Warm the browser cache for every image in the current variant so
  // thumbnail-driven swaps are instant (no flash of loading image mid-slide).
  // Runs on mount and again whenever the user changes color variant.
  useEffect(() => {
    if (typeof window === 'undefined') return
    currentImages.forEach((src) => {
      if (!src) return
      const img = new window.Image()
      img.src = src
    })
  }, [currentImages])

  let actualSelectedSize = selectedSize
  if (currentSizes.length > 0 && !currentSizes.includes(selectedSize)) {
    actualSelectedSize = currentSizes[0]
  }

  const handleAddToCart = () => {
    if (!actualSelectedSize) {
      alert(tDetail('selectSize'))
      return
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.priceNumber,
        image: currentImages[selectedImageIndex] || product.image,
        size: actualSelectedSize,
        color: selectedVariant?.color,
        colorHex: selectedVariant?.colorHex,
      })
    }
    setIsCartOpen(true)
  }

  // Calculate related products using similarity algorithm
  const relatedProducts = useMemo(
    () => getRelatedProducts(product, allProducts, 4),
    [product, allProducts],
  )

  return (
    <PageContainer>
      {/* Noisy Background Texture */}
      <div className="fixed inset-0 opacity-20 pointer-events-none mix-blend-multiply z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>
      <div className="relative z-10">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList className="text-muted-foreground">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="hover:text-foreground transition-colors">
                      {tNav('home')}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/products" className="hover:text-foreground transition-colors">
                      {tNav('products')}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-bold">
                    {product.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 hover:text-muted-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {tDetail('back')}
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image with Zoom — crossfade + slide on change. The
                  outer div reserves space via aspect-[3/4] so the absolutely
                  positioned motion children have a defined height to fill.
                  `imageDirection` tracks the last user input (thumbnail or
                  variant swap) so slide direction matches intuition. */}
              {/* Carousel — both outgoing and incoming images share the same
                  absolute frame and slide together. overflow-hidden on the
                  frame clips the off-screen image. Direction-aware so clicks
                  forward slide the new image in from the right, backward
                  from the left. */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                <AnimatePresence initial={false} custom={imageDirection}>
                  <motion.div
                    key={currentImages[selectedImageIndex] || product.image}
                    custom={imageDirection}
                    variants={{
                      enter: (dir: number) => ({ x: dir >= 0 ? '100%' : '-100%' }),
                      center: { x: 0 },
                      exit: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%' }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: 'tween', duration: 0.35, ease: [0.32, 0.72, 0, 1] } }}
                    className="absolute inset-0"
                  >
                    <ImageZoom
                      src={currentImages[selectedImageIndex] || product.image}
                      alt={product.name}
                      className="aspect-[3/4]"
                      zoomLevel={2.5}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Thumbnail Images */}
              {currentImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {currentImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setImageDirection(
                          index > selectedImageIndex ? 1 : index < selectedImageIndex ? -1 : 0,
                        )
                        setSelectedImageIndex(index)
                      }}
                      className={`aspect-square bg-muted rounded-sm overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImageIndex === index ? 'border-foreground' : 'border-transparent'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={img}
                          alt={`View ${index + 1}`}
                          fill
                          className="object-cover opacity-60 hover:opacity-100 transition-opacity"
                          sizes="80px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <h1 className="text-3xl lg:text-4xl mb-4 uppercase">{product.name}</h1>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold">{product.price}</p>
                  {product.originalPrice && (
                    <p className="text-lg text-muted-foreground line-through">
                      {product.originalPrice}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tDetail('vatIncluded')}</p>
              </div>

              {product.description &&
                (() => {
                  const paragraphs = product.description.split(/\n{2,}/).filter(Boolean)
                  // Treat the first paragraph as the teaser. If the
                  // description is short enough to live in ~2 paragraphs
                  // we just render the whole thing; otherwise show only
                  // the first paragraph + a "View more" toggle.
                  const isLong = paragraphs.length > 2 || (paragraphs[0]?.length ?? 0) > 260
                  const visible = descExpanded || !isLong ? paragraphs : [paragraphs[0]]

                  return (
                    <div className="space-y-3 text-muted-foreground leading-relaxed">
                      {visible.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                      {isLong && (
                        <button
                          type="button"
                          onClick={() => setDescExpanded((v) => !v)}
                          className="inline-flex items-center text-sm uppercase tracking-wide text-foreground hover:underline"
                        >
                          {descExpanded ? tCommon('showLess') : tCommon('showMore')}
                          <span className="ml-1">{descExpanded ? '↑' : '↓'}</span>
                        </button>
                      )}
                    </div>
                  )
                })()}

              {/* Color Selection */}
              {product.colorVariants.length > 0 && (
                <div>
                  <label className="block mb-3 text-sm uppercase tracking-wide">
                    {tDetail('colorLabel')} - {selectedVariant?.color || tDetail('colorChoose')}
                  </label>
                  <div className="flex gap-2">
                    {product.colorVariants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedVariantIndex(index)
                          setSelectedImageIndex(0)
                        }}
                        className={`w-10 h-10 rounded-sm border-2 transition-all hover:scale-110 ${
                          selectedVariantIndex === index ? 'border-foreground' : 'border-border'
                        }`}
                        style={{ backgroundColor: variant.colorHex }}
                        title={variant.color}
                      />
                    ))}
                  </div>
                  {selectedVariant && !selectedVariant.inStock && (
                    <p className="text-sm text-red-500 mt-2">{tDetail('colorOutOfStock')}</p>
                  )}
                </div>
              )}

              {/* Size Selection */}
              {currentSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm uppercase tracking-wide">
                      {tDetail('sizeLabel')}
                    </label>
                    <div className="flex items-center gap-3">
                      <SizeChartModal sizeChart={product.sizeChart} productName={product.name} />
                      <button
                        type="button"
                        onClick={() => setIsSizePickerOpen(true)}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        {tDetail('sizeFinder')}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {currentSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 border-2 rounded-sm transition-all hover:scale-105 ${
                          actualSelectedSize === size
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block mb-3 text-sm uppercase tracking-wide">
                  {tDetail('quantityLabel')}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 border-2 border-border rounded-sm flex items-center justify-center hover:border-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 border-2 border-border rounded-sm flex items-center justify-center hover:border-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => setIsTryOnOpen(true)}
                  className="w-full bg-primary text-primary-foreground py-6 rounded-sm hover:bg-background hover:text-foreground border-2 border-primary hover:border-foreground transition-all hover:scale-[1.02] uppercase tracking-[0.2em] font-bold text-xs flex items-center justify-center gap-3 group shadow-2xl"
                >
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse text-yellow-500" />
                  {tDetail('tryOn')}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant?.inStock}
                  className="w-full bg-background text-foreground py-6 rounded-sm border-2 border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-[1.02] uppercase tracking-[0.2em] font-bold text-xs flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {selectedVariant?.inStock ? tProducts('addToCart') : tProducts('outOfStock')}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`border-2 py-4 rounded-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-[0.1em] font-bold text-[10px] ${
                      isWishlisted(product.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-current' : ''}`}
                    />
                    {isWishlisted(product.id) ? tDetail('wishlistSaved') : tDetail('wishlistAdd')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const url = typeof window !== 'undefined' ? window.location.href : ''
                      const shareData = {
                        title: product.name,
                        text: product.name,
                        url,
                      }
                      // Web Share API on supported devices (mobile mostly)
                      // — opens the native sheet so users can pick Zalo,
                      // Messenger, etc. AbortError = user dismissed; not
                      // worth toasting.
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        try {
                          await navigator.share(shareData)
                          return
                        } catch (err) {
                          if ((err as { name?: string })?.name === 'AbortError') return
                          // fall through to clipboard
                        }
                      }
                      try {
                        await navigator.clipboard.writeText(url)
                        toast.success(tDetail('copySuccess'))
                      } catch {
                        toast.error(tDetail('copyError'))
                      }
                    }}
                    className="border-2 border-border py-4 rounded-sm hover:border-foreground transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-[0.1em] font-bold text-[10px]"
                  >
                    <Share2 className="w-4 h-4" />
                    {tDetail('share')}
                  </button>
                </div>
              </div>

              {/* Features Info Cards */}
              <FeaturesBadges variant="grid" />

              {/* Product Features List */}
              {product.features.length > 0 && (
                <div className="pt-8 border-t border-border">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-6 italic">
                    {tDetail('specifications')}
                  </h3>
                  <ul className="grid grid-cols-1 gap-4">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-4 group">
                        <div className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Products Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <h2 className="text-2xl mb-8 uppercase">{tDetail('related')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item, index) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  index={index}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              ))}
            </div>
          </motion.section>

          {/* Product Reviews Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <ProductReviews productId={product.id} productName={product.name} />
          </motion.section>

          {/* Recently Viewed Section */}
          <RecentlyViewed excludeId={product.id} />
        </div>
      </div>

      <VirtualTryOnModal
        product={{
          id: product.id,
          name: product.name,
          image: currentImages[selectedImageIndex] || product.image,
          priceDisplay: product.price,
          color: selectedVariant?.color,
          features: product.features,
        }}
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
      />

      {/* Smart size picker — /size-guide has been removed; the picker
          is now only accessible here, opened in a modal pre-filtered
          to this product's category. On "apply", syncs the recommended
          size onto the product's size selector and closes. */}
      <Dialog open={isSizePickerOpen} onOpenChange={setIsSizePickerOpen}>
        <DialogContent className="max-w-lg p-0 sm:p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="uppercase tracking-wide">Chọn Size Thông Minh</DialogTitle>
          </DialogHeader>
          <div className="p-4 sm:p-6">
            <SmartSizePicker
              hideHeader
              defaultProductType={sizePickerDefaultType}
              onPickSize={(size) => {
                if (currentSizes.includes(size)) {
                  setSelectedSize(size)
                  setIsSizePickerOpen(false)
                  toast.success(`Đã chọn size ${size}`)
                } else {
                  toast.info(
                    `Sản phẩm này không còn size ${size} — gợi ý các size hiện có: ${currentSizes.join(', ') || 'hết hàng'}`,
                  )
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
