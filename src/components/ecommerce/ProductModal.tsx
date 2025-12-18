'use client'

import { Heart, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const { addToCart, setIsCartOpen } = useCart()

  if (!product) return null

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.priceNumber,
      image: product.image,
      size: selectedSize,
    })
    onClose()
    setIsCartOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-gray-100 aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Details */}
          <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
            <div>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <DialogTitle className="text-3xl mb-4">{product.name}</DialogTitle>
              <p className="text-2xl font-bold">{product.price}</p>
            </div>

            <p className="text-gray-700">
              {product.description ||
                'Sản phẩm chất lượng cao với thiết kế hiện đại, phù hợp cho mọi hoạt động thể thao. Chất liệu thấm hút mồ hôi tốt, co giãn 4 chiều mang lại cảm giác thoải mái tối đa.'}
            </p>

            {/* Size Selection */}
            <div>
              <label className="block mb-3 uppercase tracking-wide text-sm">Chọn Size</label>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 ${
                      selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-300'
                    }`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-3 uppercase tracking-wide text-sm">Số Lượng</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-black text-white hover:bg-gray-800 uppercase tracking-wide"
                size="lg"
              >
                THÊM VÀO GIỎ HÀNG
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-black hover:bg-black hover:text-white uppercase tracking-wide"
                size="lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                YÊU THÍCH
              </Button>
            </div>

            {/* Features */}
            <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Miễn phí vận chuyển đơn từ 500K
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Đổi trả trong 30 ngày
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Bảo hành 12 tháng
              </p>
            </div>

            {/* View Full Details Link */}
            <div className="pt-4 border-t border-gray-200">
              <Button variant="link" asChild className="p-0">
                <Link href={`/products/${product.id}`} onClick={onClose}>
                  Xem chi tiết sản phẩm →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
