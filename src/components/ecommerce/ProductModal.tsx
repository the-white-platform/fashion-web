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
} from 'lucide-react'
import { VirtualTryOnModal } from './VirtualTryOnModal'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'motion/react'

interface Product {
  id: number
  name: string
  category: string
  price: string
  priceNumber: number
  image: string
  description?: string
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

const sizes = ['S', 'M', 'L', 'XL', 'XXL']

const colors = [
  { name: 'Đen', hex: '#1d2122' },
  { name: 'Trắng', hex: '#ebe7db' },
  { name: 'Xám', hex: '#a9a9a9' },
  { name: 'Xanh lá', hex: '#a6d6ca' },
  { name: 'Xanh dương', hex: '#b9c1e8' },
]

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [quantity, setQuantity] = useState(1)
  const [isTryOnOpen, setIsTryOnOpen] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isImageHovered, setIsImageHovered] = useState(false)
  const { addToCart, setIsCartOpen } = useCart()

  if (!product) return null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.priceNumber,
        image: product.image,
        size: selectedSize,
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
        <DialogContent className="!max-w-[95vw] !w-[95vw] md:!max-w-6xl md:!w-auto !max-h-[90vh] p-0 gap-0 bg-white overflow-hidden border-0 shadow-2xl rounded-sm">
          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="absolute top-3 right-3 z-50 w-10 h-10 bg-black text-white hover:bg-gray-900 transition-all flex items-center justify-center group rounded-sm"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </motion.button>

          <div className="grid md:grid-cols-[1fr,1fr] max-h-[90vh] overflow-hidden">
            {/* Image Section - Left Side */}
            <div
              className="relative bg-gray-50 overflow-hidden h-full"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              {/* Product Image with Zoom Effect */}
              <motion.div
                className="relative w-full h-full"
                animate={{ scale: isImageHovered ? 1.05 : 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 55vw"
                  priority
                />
              </motion.div>

              {/* Premium Badge */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-5 left-5"
              >
                <div className="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl rounded-sm">
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
                className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md px-5 py-3 shadow-xl flex items-center gap-3 rounded-sm"
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="h-4 w-px bg-gray-300" />
                <span className="text-sm font-bold">4.9</span>
                <span className="text-xs text-gray-500">(127 đánh giá)</span>
              </motion.div>

              {/* Wishlist Button on Image */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                onClick={handleWishlist}
                className={`absolute bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all ${
                  isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-red-50'
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-transform ${isWishlisted ? 'fill-white scale-110' : ''}`}
                />
              </motion.button>
            </div>

            {/* Details Section - Right Side */}
            <div className="p-6 flex flex-col bg-white">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <p className="text-[9px] text-gray-400 mb-1 uppercase tracking-[0.2em] font-medium">
                  {product.category}
                </p>
                <DialogTitle className="text-xl mb-2 uppercase font-black tracking-tight leading-tight pr-8">
                  {product.name}
                </DialogTitle>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl font-black">{product.price}</span>
                  <span className="text-sm text-gray-400 line-through font-medium">1.190.000₫</span>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {product.description ||
                    'Thiết kế hiện đại với chất liệu cao cấp, thấm hút mồ hôi và co giãn 4 chiều.'}
                </p>
              </motion.div>

              {/* Color Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-4"
              >
                <label className="block mb-2 text-[9px] uppercase tracking-[0.15em] font-bold text-gray-900">
                  Màu Sắc - {selectedColor.name}
                </label>
                <div className="flex gap-2">
                  {colors.map((color, idx) => (
                    <motion.button
                      key={color.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + idx * 0.05 }}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-sm border-2 transition-all hover:scale-110 ${
                        selectedColor.hex === color.hex
                          ? 'border-black shadow-lg'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Size Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-gray-900">
                    Chọn Size
                  </label>
                  <Link
                    href="/size-guide"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-gray-500 hover:text-black transition-colors"
                  >
                    Hướng dẫn
                  </Link>
                </div>
                <div className="flex gap-2">
                  {sizes.map((size, idx) => (
                    <motion.button
                      key={size}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      onClick={() => setSelectedSize(size)}
                      className={`relative w-10 h-10 font-bold text-xs transition-all duration-200 rounded-sm ${
                        selectedSize === size
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                      {selectedSize === size && (
                        <motion.div
                          layoutId="size-indicator"
                          className="absolute inset-0 bg-black rounded-sm"
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
                <label className="block mb-2 text-[9px] uppercase tracking-[0.15em] font-bold text-gray-900">
                  Số Lượng
                </label>
                <div className="inline-flex items-center bg-gray-100 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
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
                      className="w-full bg-black text-white h-12 flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] text-xs shadow-lg hover:shadow-xl transition-shadow group rounded-sm"
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
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Truck className="w-4 h-4" />
                    </div>
                    <p className="text-[8px] uppercase tracking-wider font-bold text-gray-900">
                      Free Ship
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <p className="text-[8px] uppercase tracking-wider font-bold text-gray-900">
                      Đổi Trả
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Shield className="w-4 h-4" />
                    </div>
                    <p className="text-[8px] uppercase tracking-wider font-bold text-gray-900">
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
