'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  Sparkles,
  Truck,
  RefreshCw,
  Shield,
  Plus,
  Minus,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useCart } from '@/contexts/CartContext'
import { ImageZoom } from '@/components/ecommerce/ImageZoom'
import { ProductReviews } from '@/components/ecommerce/ProductReviews'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { VirtualTryOnModal } from '@/components/ecommerce/VirtualTryOnModal'
import type { ProductForFrontend } from '@/utilities/getProducts'
import { getRelatedProducts } from '@/utilities/getRelatedProducts'
import { Link } from '@/i18n/Link'

interface ProductDetailClientProps {
  product: ProductForFrontend
  allProducts: ProductForFrontend[]
}

export default function ProductDetailClient({ product, allProducts }: ProductDetailClientProps) {
  const router = useRouter()
  const { addToCart, setIsCartOpen } = useCart()

  // State
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isTryOnOpen, setIsTryOnOpen] = useState(false)

  // Get current variant
  const selectedVariant = product.colorVariants[selectedVariantIndex]
  const currentImages = selectedVariant?.images || product.images || []
  const currentSizes = selectedVariant?.sizes || product.sizes || []

  // Set initial size when variant changes
  useMemo(() => {
    if (currentSizes.length > 0 && !currentSizes.includes(selectedSize)) {
      setSelectedSize(currentSizes[0])
    }
  }, [selectedVariantIndex, currentSizes, selectedSize])

  // Reset image index when variant changes
  useMemo(() => {
    setSelectedImageIndex(0)
  }, [selectedVariantIndex])

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Vui lòng chọn size')
      return
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.priceNumber,
        image: currentImages[selectedImageIndex] || product.image,
        size: selectedSize,
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
    <div className="min-h-screen pt-32 bg-background text-foreground pb-12 relative">
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
                      Trang chủ
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/products" className="hover:text-foreground transition-colors">
                      Sản phẩm
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
            Quay lại
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image with Zoom */}
              <ImageZoom
                src={currentImages[selectedImageIndex] || product.image}
                alt={product.name}
                className="aspect-[3/4] bg-muted rounded-sm"
                zoomLevel={2.5}
              />

              {/* Thumbnail Images */}
              {currentImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {currentImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
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
                <p className="text-sm text-muted-foreground mt-1">Đã bao gồm VAT</p>
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}

              {/* Color Selection */}
              {product.colorVariants.length > 0 && (
                <div>
                  <label className="block mb-3 text-sm uppercase tracking-wide">
                    Màu Sắc - {selectedVariant?.color || 'Chọn màu'}
                  </label>
                  <div className="flex gap-2">
                    {product.colorVariants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariantIndex(index)}
                        className={`w-10 h-10 rounded-sm border-2 transition-all hover:scale-110 ${
                          selectedVariantIndex === index ? 'border-foreground' : 'border-border'
                        }`}
                        style={{ backgroundColor: variant.colorHex }}
                        title={variant.color}
                      />
                    ))}
                  </div>
                  {selectedVariant && !selectedVariant.inStock && (
                    <p className="text-sm text-red-500 mt-2">Màu này hiện đang hết hàng</p>
                  )}
                </div>
              )}

              {/* Size Selection */}
              {currentSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm uppercase tracking-wide">Chọn Size</label>
                    <Link
                      href="/size-guide"
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Hướng dẫn chọn size
                    </Link>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {currentSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 border-2 rounded-sm transition-all hover:scale-105 ${
                          selectedSize === size
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
                <label className="block mb-3 text-sm uppercase tracking-wide">Số Lượng</label>
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
                  Thử Đồ Ảo
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant?.inStock}
                  className="w-full bg-background text-foreground py-6 rounded-sm border-2 border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-[1.02] uppercase tracking-[0.2em] font-bold text-xs flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {selectedVariant?.inStock ? 'Thêm Vào Giỏ Hàng' : 'Hết Hàng'}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`border-2 py-4 rounded-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-[0.1em] font-bold text-[10px] ${
                      isWishlisted
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    {isWishlisted ? 'Đã Lưu' : 'Yêu Thích'}
                  </button>
                  <button className="border-2 border-border py-4 rounded-sm hover:border-foreground transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-[0.1em] font-bold text-[10px]">
                    <Share2 className="w-4 h-4" />
                    Chia Sẻ
                  </button>
                </div>
              </div>

              {/* Features Info Cards */}
              <div className="pt-10 border-t border-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-muted flex items-center justify-center mb-1 transition-colors group-hover:bg-primary">
                      <Truck className="w-6 h-6 text-foreground" />
                    </div>
                    <p className="font-bold uppercase text-[10px] tracking-widest leading-tight">
                      Vận Chuyển
                      <br />
                      Miễn Phí
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-muted flex items-center justify-center mb-1">
                      <RefreshCw className="w-6 h-6 text-foreground" />
                    </div>
                    <p className="font-bold uppercase text-[10px] tracking-widest leading-tight">
                      Đổi Trả
                      <br />
                      30 Ngày
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 bg-muted flex items-center justify-center mb-1">
                      <Shield className="w-6 h-6 text-foreground" />
                    </div>
                    <p className="font-bold uppercase text-[10px] tracking-widest leading-tight">
                      Chính Hãng
                      <br />
                      Bảo Hành
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Features List */}
              {product.features.length > 0 && (
                <div className="pt-8 border-t border-border">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-6 italic">
                    Đặc Điểm Kỹ Thuật
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
            <h2 className="text-2xl mb-8 uppercase">Sản Phẩm Liên Quan</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="group">
                  <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4] rounded-sm">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <h3 className="mb-2 font-medium group-hover:text-muted-foreground transition-colors">
                    {item.name}
                  </h3>
                  <div className="font-bold">{item.price}</div>
                </Link>
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
        </div>
      </div>

      <VirtualTryOnModal
        product={{
          id: product.id,
          name: product.name,
          image: currentImages[selectedImageIndex] || product.image,
          priceDisplay: product.price,
        }}
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
      />
    </div>
  )
}
