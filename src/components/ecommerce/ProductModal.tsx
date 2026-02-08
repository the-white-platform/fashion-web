'use client'

import {
  Heart,
  Plus,
  Minus,
  Sparkles,
  ShoppingCart,
  X,
  Truck,
  RefreshCw,
  Shield,
  Star,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { VirtualTryOnModal } from './VirtualTryOnModal'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'motion/react'
import type { ColorVariant } from '@/utilities/getProducts'

interface Product {
  id: number
  name: string
  category: string
  price: string
  priceNumber: number
  image: string
  images: string[]
  colorVariants: ColorVariant[]
  sizes: string[]
  description?: string
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isTryOnOpen, setIsTryOnOpen] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isImageHovered, setIsImageHovered] = useState(false)
  const { addToCart, setIsCartOpen } = useCart()

  // Get current variant or use default
  const currentVariant = product?.colorVariants?.[selectedVariantIndex] || {
    color: 'Default',
    colorHex: '#000000',
    sizes: product?.sizes || [],
    images: product?.images || [product?.image],
    inStock: true,
  }

  // Get available sizes for current variant
  const availableSizes = currentVariant.sizes

  // Get images for current variant
  const variantImages: string[] =
    currentVariant.images.length > 0
      ? (currentVariant.images.filter((img): img is string => typeof img === 'string') as string[])
      : [product?.image || ''].filter((img) => img !== '')

  // Auto-select first size when variant changes
  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0])
    }
  }, [selectedVariantIndex, availableSizes, selectedSize])

  if (!product) return null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.priceNumber,
        image: variantImages[currentImageIndex] || product.image,
        size: selectedSize,
        color: currentVariant.color,
        colorHex: currentVariant.colorHex,
      })
    }
    setAddedToCart(true)
    setTimeout(() => {
      onClose()
      setIsCartOpen(true)
      setAddedToCart(false)
    }, 800)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] md:!max-w-6xl md:!w-auto !max-h-[90vh] p-0 gap-0 bg-background overflow-hidden border-0 shadow-2xl rounded-sm">
          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="absolute top-3 right-3 z-50 w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center group rounded-sm"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </motion.button>

          <div className="grid md:grid-cols-[1fr,1fr] max-h-[90vh] overflow-hidden">
            {/* Image Section - Left Side */}
            <div
              className="relative bg-muted overflow-hidden h-full"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              {/* Product Image with Zoom Effect */}
              <motion.div
                className="relative w-full h-full"
                animate={{ scale: isImageHovered ? 1.05 : 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedVariantIndex}-${currentImageIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={variantImages[currentImageIndex]}
                      alt={`${product.name} - ${currentVariant.color}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 55vw"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Image Navigation */}
                {variantImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? variantImages.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === variantImages.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Image Indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {variantImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIndex ? 'bg-foreground w-6' : 'bg-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Premium Badge */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-5 left-5"
              >
                <div className="bg-primary text-primary-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl rounded-sm">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Mới Nhất
                  </span>
                </div>
              </motion.div>

              {/* Discount Badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute top-5 right-16"
              >
                <div className="bg-red-500 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl rounded-sm">
                  -25%
                </div>
              </motion.div>

              {/* Rating Float */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-5 left-5 bg-background/95 backdrop-blur-md px-5 py-3 shadow-xl flex items-center gap-3 rounded-sm border border-border"
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-sm font-bold text-foreground">4.9</span>
                <span className="text-xs text-muted-foreground">(127 đánh giá)</span>
              </motion.div>

              {/* Wishlist Button on Image */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                onClick={handleWishlist}
                className={`absolute bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-background text-foreground hover:bg-muted'
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-transform ${isWishlisted ? 'fill-white scale-110' : ''}`}
                />
              </motion.button>
            </div>

            {/* Details Section - Right Side */}
            <div className="p-6 flex flex-col bg-card">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <p className="text-[9px] text-muted-foreground mb-1 uppercase tracking-[0.2em] font-medium">
                  {product.category}
                </p>
                <DialogTitle className="text-xl mb-2 uppercase font-black tracking-tight leading-tight pr-8 text-foreground">
                  {product.name}
                </DialogTitle>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl font-black text-foreground">{product.price}</span>
                  <span className="text-sm text-muted-foreground line-through font-medium">
                    1.190.000₫
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {product.description ||
                    'Thiết kế hiện đại với chất liệu cao cấp, thấm hút mồ hôi và co giãn 4 chiều.'}
                </p>
              </motion.div>

              {/* Color Selection */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-4"
                >
                  <label className="block mb-2 text-[9px] uppercase tracking-[0.15em] font-bold text-foreground">
                    Màu Sắc - {currentVariant.color}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {/* Sort variants: in-stock first, then out-of-stock */}
                    {[...product.colorVariants]
                      .sort((a, b) => {
                        if (a.inStock === b.inStock) return 0
                        return a.inStock ? -1 : 1
                      })
                      .map((variant, sortedIdx) => {
                        // Find original index for state management
                        const originalIdx = product.colorVariants.findIndex(
                          (v) => v.color === variant.color && v.colorHex === variant.colorHex,
                        )

                        return (
                          <motion.button
                            key={`${variant.color}-${originalIdx}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + sortedIdx * 0.05 }}
                            onClick={() => {
                              if (variant.inStock) {
                                setSelectedVariantIndex(originalIdx)
                                setCurrentImageIndex(0)
                              }
                            }}
                            className={`relative w-10 h-10 rounded-sm border-2 transition-all ${
                              variant.inStock ? 'hover:scale-110' : 'cursor-not-allowed'
                            } ${
                              selectedVariantIndex === originalIdx
                                ? 'border-foreground shadow-lg'
                                : 'border-border hover:border-foreground'
                            } ${!variant.inStock ? 'opacity-40' : ''}`}
                            style={{ backgroundColor: variant.colorHex }}
                            title={`${variant.color}${!variant.inStock ? ' (Hết hàng)' : ''}`}
                            disabled={!variant.inStock}
                          >
                            {/* Strikethrough indicator for out-of-stock */}
                            {!variant.inStock && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-[2px] bg-red-500 rotate-45 transform scale-150" />
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                  </div>
                </motion.div>
              )}

              {/* Size Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-foreground">
                    Chọn Size
                  </label>
                  <Link
                    href="/size-guide"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hướng dẫn
                  </Link>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {availableSizes.map((size, idx) => (
                    <motion.button
                      key={size}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      onClick={() => setSelectedSize(size)}
                      className={`relative w-10 h-10 font-bold text-xs transition-all duration-200 rounded-sm ${
                        selectedSize === size
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {size}
                      {selectedSize === size && (
                        <motion.div
                          layoutId="size-indicator"
                          className="absolute inset-0 bg-primary rounded-sm"
                          style={{ zIndex: -1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Quantity */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-4"
              >
                <label className="block mb-2 text-[9px] uppercase tracking-[0.15em] font-bold text-foreground">
                  Số Lượng
                </label>
                <div className="inline-flex items-center bg-muted rounded-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-background/50 transition-colors text-foreground"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold select-none text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-background/50 transition-colors text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 mb-4"
              >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full bg-green-500 text-white h-12 flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] text-xs rounded-sm"
                    >
                      <Check className="w-4 h-4" />
                      Đã Thêm Vào Giỏ Hàng
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add-to-cart"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      className="w-full bg-primary text-primary-foreground h-12 flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] text-xs shadow-lg hover:shadow-xl transition-shadow group rounded-sm"
                    >
                      <ShoppingCart className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                      Thêm Vào Giỏ Hàng
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Secondary Action */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsTryOnOpen(true)}
                  className="w-full h-12 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] text-xs shadow-lg hover:shadow-xl transition-all group relative overflow-hidden rounded-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Thử Đồ Ảo AI
                </motion.button>

                {/* Features Strip */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto mb-1 text-foreground">
                      <Truck className="w-4 h-4" />
                    </div>
                    <p className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground">
                      Free Ship
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto mb-1 text-foreground">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <p className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground">
                      Đổi Trả
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto mb-1 text-foreground">
                      <Shield className="w-4 h-4" />
                    </div>
                    <p className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground">
                      Bảo Hành
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <VirtualTryOnModal
        product={{
          id: product.id,
          name: product.name,
          image: product.image,
          priceDisplay: product.price,
        }}
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
      />
    </>
  )
}
