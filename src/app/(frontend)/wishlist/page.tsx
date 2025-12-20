'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, ShoppingCart, Share2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface WishlistItem {
  id: number
  name: string
  category: string
  price: number
  priceDisplay: string
  image: string
  inStock: boolean
  sizes: string[]
}

export default function WishlistPage() {
  const router = useRouter()
  const { addToCart, setIsCartOpen } = useCart()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({})

  // Load wishlist from localStorage only after mount (client-side)
  // This ensures server and client initial renders match
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('thewhite_wishlist')
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist))
      }
    } catch (e) {
      console.error('Error loading wishlist:', e)
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('thewhite_wishlist', JSON.stringify(wishlistItems))
    } catch (e) {
      console.error('Error saving wishlist:', e)
    }
  }, [wishlistItems])

  const removeFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id))
  }

  const handleAddToCart = (item: WishlistItem) => {
    const size = selectedSizes[item.id] || item.sizes[0]
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: size,
    })
    setIsCartOpen(true)
  }

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      if (item.inStock) {
        const size = selectedSizes[item.id] || item.sizes[0]
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          size: size,
        })
      }
    })
    setIsCartOpen(true)
  }

  const handleShare = () => {
    const wishlistIds = wishlistItems.map((item) => item.id).join(',')
    const shareUrl = `${window.location.origin}/wishlist?items=${wishlistIds}`
    navigator.clipboard.writeText(shareUrl)
    alert('Đã sao chép link wishlist!')
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Danh Sách Yêu Thích</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl uppercase tracking-wide mb-2">Danh Sách Yêu Thích</h1>
            <p className="text-gray-600">{wishlistItems.length} sản phẩm</p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-sm hover:border-black transition-colors bg-white text-black"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Chia Sẻ</span>
              </button>
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Thêm Tất Cả Vào Giỏ</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gray-50 rounded-sm overflow-hidden group"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.id}`}
                    className="relative aspect-[3/4] bg-gray-200 overflow-hidden block"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        removeFromWishlist(item.id)
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-sm flex items-center justify-center hover:bg-red-50 transition-colors z-10"
                    >
                      <Heart className="w-5 h-5 fill-red-600 text-red-600" />
                    </button>

                    {/* Stock Badge */}
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge className="bg-white text-black border-0">Hết Hàng</Badge>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-gray-600 mb-1 uppercase">{item.category}</p>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="mb-2 font-medium hover:text-gray-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold mb-4">{item.priceDisplay}</p>

                    {/* Size Selection */}
                    {item.inStock && (
                      <div className="mb-4">
                        <label className="block text-xs text-gray-600 mb-2 uppercase">Size</label>
                        <div className="flex gap-2 flex-wrap">
                          {item.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() =>
                                setSelectedSizes({ ...selectedSizes, [item.id]: size })
                              }
                              className={`px-3 py-1 text-xs rounded-sm border-2 transition-colors ${
                                (selectedSizes[item.id] || item.sizes[0]) === size
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-black border-gray-300 hover:border-black'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    {item.inStock ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-wide"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Thêm Vào Giỏ
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 border-2 border-gray-300 text-gray-400 rounded-sm uppercase tracking-wide cursor-not-allowed"
                      >
                        Hết Hàng
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl uppercase tracking-wide mb-3">Danh Sách Yêu Thích Trống</h2>
            <p className="text-gray-600 mb-8">Thêm sản phẩm yêu thích để dễ dàng mua sắm sau này</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-black text-white px-8 py-4 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Khám Phá Sản Phẩm
            </button>
          </motion.div>
        )}

        {/* Info Section */}
        {wishlistItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-gray-50 rounded-sm p-8"
          >
            <h3 className="uppercase tracking-wide mb-4">💡 Mẹo Hữu Ích</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Sản phẩm trong wishlist sẽ được lưu trữ trên thiết bị của bạn</li>
              <li>• Nhấn vào sản phẩm để xem chi tiết</li>
              <li>• Chia sẻ wishlist với bạn bè qua link</li>
              <li>• Thêm tất cả sản phẩm vào giỏ hàng chỉ với một cú click</li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  )
}
