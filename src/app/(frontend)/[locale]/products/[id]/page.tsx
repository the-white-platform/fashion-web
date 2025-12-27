'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
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

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2X']
const colors = [
  { name: 'Xám', hex: '#d9d9d9' },
  { name: 'Xanh lá', hex: '#a6d6ca' },
  { name: 'Xám đậm', hex: '#a9a9a9' },
  { name: 'Đen', hex: '#1e1e1e' },
  { name: 'Trắng', hex: '#ffffff' },
  { name: 'Xanh dương', hex: '#b9c1e8' },
]

const productImages = [
  '/assets/76dd060158d6b1fe3783b073b0394f9caaf7d936.png',
  '/assets/473cf109c5de16744da27ab1fe532e88a298c151.png',
  '/assets/95b4d7fad816f6024c517ca6660f0fb21102af21.png',
  '/assets/145cb6cef068c6de9269b418898ca5c6fcbf507b.png',
  '/assets/0193c0f6281560910dc42eeaf0507393821fd4b1.png',
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id ? String(params.id) : '1'

  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState(colors[3])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isTryOnOpen, setIsTryOnOpen] = useState(false)
  const { addToCart, setIsCartOpen } = useCart()

  // Mock product data - in real app, fetch from API/Payload CMS
  const product = {
    id: parseInt(productId),
    name: 'Áo In Họa Tiết Abstract',
    category: 'Áo Thể Thao',
    price: 890000,
    priceDisplay: '890.000₫',
    description:
      'Áo thun oversize với thiết kế in họa tiết abstract độc đáo. Chất liệu cotton cao cấp, thoáng mát. Phù hợp cho hoạt động thể thao và đi chơi hàng ngày.',
    features: [
      'Chất liệu cotton 100% cao cấp',
      'Công nghệ thấm hút mồ hôi tốt',
      'Form dáng oversize hiện đại',
      'In họa tiết bền màu',
    ],
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImages[selectedImage],
        size: selectedSize,
      })
    }
    setIsCartOpen(true)
  }

  const relatedProducts = [
    { id: 1, name: 'Áo Thể Thao Premium 1', price: '890.000₫', image: productImages[0] },
    { id: 2, name: 'Áo Thể Thao Premium 2', price: '890.000₫', image: productImages[1] },
    { id: 3, name: 'Áo Thể Thao Premium 3', price: '890.000₫', image: productImages[2] },
    { id: 4, name: 'Áo Thể Thao Premium 4', price: '890.000₫', image: productImages[3] },
  ]

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
                src={productImages[selectedImage]}
                alt={product.name}
                className="aspect-[3/4] bg-muted rounded-sm"
                zoomLevel={2.5}
              />

              {/* Thumbnail Images */}
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-muted rounded-sm overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index ? 'border-foreground' : 'border-transparent'
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
                <p className="text-2xl mb-2 font-bold">{product.priceDisplay}</p>
                <p className="text-sm text-muted-foreground">Đã bao gồm VAT</p>
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Color Selection */}
              <div>
                <label className="block mb-3 text-sm uppercase tracking-wide">
                  Màu Sắc - {selectedColor.name}
                </label>
                <div className="flex gap-2">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-sm border-2 transition-all hover:scale-110 ${
                        selectedColor.hex === color.hex ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
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
                  {sizes.map((size) => (
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
                  className="w-full bg-background text-foreground py-6 rounded-sm border-2 border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-[1.02] uppercase tracking-[0.2em] font-bold text-xs flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm Vào Giỏ Hàng
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
          image: productImages[selectedImage],
          priceDisplay: product.priceDisplay,
        }}
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
      />
    </div>
  )
}
