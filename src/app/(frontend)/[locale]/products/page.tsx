'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'
import { ProductModal } from '@/components/ecommerce/ProductModal'

// Product Type
interface Product {
  id: number
  name: string
  category: string
  price: string
  priceNumber: number
  image: string
  colors: { name: string; hex: string }[]
  tag: string
  inStock: boolean
}

// Mock Data Generator
const generateProducts = (count: number): Product[] => {
  const baseProducts: Product[] = [
    {
      id: 1,
      name: 'Áo Training Performance',
      category: 'Áo Thể Thao',
      price: '890.000₫',
      priceNumber: 890000,
      image:
        'https://images.unsplash.com/photo-1679768763201-e07480531b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      colors: [
        { name: 'Đen', hex: '#1d2122' },
        { name: 'Trắng', hex: '#ebe7db' },
      ],
      tag: 'MỚI',
      inStock: true,
    },
    {
      id: 2,
      name: 'Áo Polo Slim Fit',
      category: 'Áo Polo',
      price: '790.000₫',
      priceNumber: 790000,
      image:
        'https://images.unsplash.com/photo-1734191979156-57972139dfee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      colors: [{ name: 'Đen', hex: '#1d2122' }],
      tag: 'BÁN CHẠY',
      inStock: true,
    },
    {
      id: 3,
      name: 'Áo Thun Basic Heavy',
      category: 'Áo Thun',
      price: '690.000₫',
      priceNumber: 690000,
      image:
        'https://images.unsplash.com/photo-1599058917212-d750089bc07e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      colors: [
        { name: 'Xám', hex: '#a9a9a9' },
        { name: 'Đen', hex: '#1d2122' },
      ],
      tag: 'MỚI',
      inStock: true,
    },
    {
      id: 4,
      name: 'Áo Khoác Thể Thao',
      category: 'Áo Khoác',
      price: '1.290.000₫',
      priceNumber: 1290000,
      image:
        'https://images.unsplash.com/photo-1619253341026-74c609e6ce50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      colors: [{ name: 'Đen', hex: '#1d2122' }],
      tag: 'GIẢM 20%',
      inStock: true,
    },
    {
      id: 5,
      name: 'Quần Short Training',
      category: 'Quần Short',
      price: '590.000₫',
      priceNumber: 590000,
      image:
        'https://images.unsplash.com/photo-1679768763201-e07480531b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      colors: [{ name: 'Đen', hex: '#1d2122' }],
      tag: 'MỚI',
      inStock: false,
    },
    {
      id: 6,
      name: 'Set Đồ Tập Gym',
      category: 'Bộ Tập Luyện',
      price: '1.490.000₫',
      priceNumber: 1490000,
      image:
        'https://images.unsplash.com/photo-1734191979156-57972139dfee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      colors: [
        { name: 'Xanh', hex: '#a6d6ca' },
        { name: 'Xám', hex: '#d9d9d9' },
      ],
      tag: 'BÁN CHẠY',
      inStock: true,
    },
  ]

  const products: Product[] = []
  for (let i = 0; i < count; i++) {
    const base = baseProducts[i % baseProducts.length]
    products.push({
      ...base,
      id: i + 1,
      name: `${base.name} ${Math.floor(i / 6) + 1}`,
    })
  }
  return products
}

const allProducts = generateProducts(24)

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2X']

const categories = [
  { name: 'Tất Cả', count: 450 },
  { name: 'Áo Thun', count: 120 },
  { name: 'Áo Polo', count: 80 },
  { name: 'Áo Khoác', count: 65 },
  { name: 'Quần Short', count: 95 },
  { name: 'Quần Dài', count: 90 },
]

const colors = [
  { name: 'Đen', hex: '#1d2122' },
  { name: 'Trắng', hex: '#ebe7db' },
  { name: 'Xám', hex: '#a9a9a9' },
  { name: 'Xanh lá', hex: '#a6d6ca' },
  { name: 'Xanh dương', hex: '#b9c1e8' },
]

const priceRanges = [
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: '500K - 1M', min: 500000, max: 1000000 },
  { label: '1M - 2M', min: 1000000, max: 2000000 },
  { label: 'Trên 2M', min: 2000000, max: Infinity },
]

const quickFilters = ['MỚI', 'BÁN CHẠY', 'ÁO THUN', 'ÁO POLO', 'QUẦN SHORT', 'ÁO KHOÁC']

function ProductsPageContent() {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả')
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null)
  const [showInStock, setShowInStock] = useState(true)
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuickFilter, setActiveQuickFilter] = useState('MỚI')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const itemsPerPage = 9

  const [expandedSections, setExpandedSections] = useState({
    size: true,
    availability: true,
    category: true,
    colors: true,
    price: true,
  })

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    )
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Filter and sort logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      if (selectedCategory !== 'Tất Cả' && product.category !== selectedCategory) {
        return false
      }
      if (selectedPriceRange) {
        const range = priceRanges.find((r) => r.label === selectedPriceRange)
        if (range && (product.priceNumber < range.min || product.priceNumber >= range.max)) {
          return false
        }
      }
      if (!showInStock && product.inStock) return false
      if (!showOutOfStock && !product.inStock) return false
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceNumber - b.priceNumber
        case 'price-high':
          return b.priceNumber - a.priceNumber
        case 'popular':
          // Sort by tag (BÁN CHẠY first, then MỚI, then others)
          const tagOrder: { [key: string]: number } = { 'BÁN CHẠY': 0, MỚI: 1 }
          const aOrder = tagOrder[a.tag] ?? 2
          const bOrder = tagOrder[b.tag] ?? 2
          return aOrder - bOrder
        case 'newest':
        default:
          // Newest first (by ID, assuming higher ID = newer)
          return b.id - a.id
      }
    })

    return sorted
  }, [selectedCategory, selectedPriceRange, showInStock, showOutOfStock, searchQuery, sortBy])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const inStockCount = allProducts.filter((p) => p.inStock).length
  const outOfStockCount = allProducts.filter((p) => !p.inStock).length

  const clearFilters = () => {
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedCategory('Tất Cả')
    setSelectedPriceRange(null)
    setShowInStock(true)
    setShowOutOfStock(false)
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 relative">
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
          {/* Breadcrumb - More prominent */}
          <div className="mb-8 font-medium">
            <Breadcrumb>
              <BreadcrumbList className="text-muted-foreground">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/"
                      className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]"
                    >
                      Trang chủ
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground uppercase tracking-widest text-[10px] font-bold">
                    Sản phẩm
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-5xl mb-4 uppercase tracking-tighter font-bold italic">
                  Sản Phẩm
                </h1>
                <p className="text-muted-foreground max-w-md">
                  Khám phá bộ sưu tập thời trang thể thao cao cấp từ TheWhite. Thiết kế tối giản,
                  hiệu năng tối đa.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter and Sort Bar */}
        <div className="bg-background border-b border-border shadow-sm">
          <div className="container mx-auto px-6 py-4">
            {/* Filter Bar - Mobile Only since Desktop has sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden mb-4"
            >
              <button
                onClick={() => setShowFilters(true)}
                className="w-full bg-primary text-primary-foreground px-6 py-4 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs font-bold shadow-xl active:scale-95 transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>BỘ LỌC TÙY CHỌN</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Sort Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-4"
            >
              {/* Quick Filters */}
              <div className="flex gap-2 flex-wrap flex-1">
                {quickFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveQuickFilter(filter)}
                    className={`px-4 py-2 border text-xs tracking-wider rounded-sm transition-all hover:scale-105 ${
                      activeQuickFilter === filter
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary bg-background'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-muted border border-border px-4 py-2 pr-8 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer uppercase text-xs tracking-wide text-foreground"
                >
                  <option value="newest">MỚI NHẤT</option>
                  <option value="price-low">Giá: Thấp → Cao</option>
                  <option value="price-high">Giá: Cao → Thấp</option>
                  <option value="popular">Bán Chạy</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search Bar - Keep below sticky bar but not sticky itself */}
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 mt-8"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-sm outline-none focus:border-primary transition-colors text-foreground"
              />
            </div>
          </motion.div>

          <div className="flex gap-8">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-[280px] shrink-0 self-start sticky top-[200px]"
            >
              <div className="bg-card border border-border rounded-sm h-[calc(100vh-14rem)] overflow-hidden shadow-sm z-10">
                <ScrollIndicator className="h-full" withShadows={true}>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg uppercase tracking-wide">Bộ Lọc</h2>
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>

                    {/* Size Filter */}
                    <div>
                      <button
                        onClick={() => toggleSection('size')}
                        className="flex items-center justify-between w-full mb-3 text-sm uppercase tracking-wide hover:text-muted-foreground transition-colors"
                      >
                        Size
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedSections.size ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSections.size && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="grid grid-cols-3 gap-2"
                        >
                          {sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => toggleSize(size)}
                              className={`py-2 border rounded-sm transition-all hover:scale-105 ${
                                selectedSizes.includes(size)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:border-primary'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <div className="h-px bg-border" />

                    {/* Availability Filter */}
                    <div>
                      <button
                        onClick={() => toggleSection('availability')}
                        className="flex items-center justify-between w-full mb-3 text-sm uppercase tracking-wide hover:text-muted-foreground transition-colors"
                      >
                        Tình Trạng
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedSections.availability ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSections.availability && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={showInStock}
                              onChange={(e) => setShowInStock(e.target.checked)}
                              className="w-4 h-4 rounded-sm border-2 border-border text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-0 cursor-pointer accent-foreground"
                            />
                            <span className="group-hover:text-muted-foreground transition-colors">
                              Còn hàng{' '}
                              <span className="text-muted-foreground">({inStockCount})</span>
                            </span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={showOutOfStock}
                              onChange={(e) => setShowOutOfStock(e.target.checked)}
                              className="w-4 h-4 rounded-sm border-2 border-border text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-0 cursor-pointer accent-foreground"
                            />
                            <span className="group-hover:text-muted-foreground transition-colors">
                              Hết hàng{' '}
                              <span className="text-muted-foreground">({outOfStockCount})</span>
                            </span>
                          </label>
                        </motion.div>
                      )}
                    </div>

                    <div className="h-px bg-border" />

                    {/* Category Filter */}
                    <div>
                      <button
                        onClick={() => toggleSection('category')}
                        className="flex items-center justify-between w-full mb-3 text-sm uppercase tracking-wide hover:text-muted-foreground transition-colors"
                      >
                        Danh Mục
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedSections.category ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSections.category && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          {categories.map((cat) => (
                            <button
                              key={cat.name}
                              onClick={() => setSelectedCategory(cat.name)}
                              className={`w-full text-left px-3 py-2 rounded-sm transition-colors ${
                                selectedCategory === cat.name
                                  ? 'bg-foreground text-background'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <span>{cat.name}</span>
                              <span
                                className={`ml-2 text-sm ${
                                  selectedCategory === cat.name
                                    ? 'text-background'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                ({cat.count})
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <div className="h-px bg-border" />

                    {/* Colors Filter */}
                    <div>
                      <button
                        onClick={() => toggleSection('colors')}
                        className="flex items-center justify-between w-full mb-3 text-sm uppercase tracking-wide hover:text-muted-foreground transition-colors"
                      >
                        Màu Sắc
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedSections.colors ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSections.colors && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex gap-2 flex-wrap"
                        >
                          {colors.map((color) => (
                            <button
                              key={color.hex}
                              onClick={() => toggleColor(color.hex)}
                              className={`w-10 h-10 rounded-sm border-2 transition-all hover:scale-110 ${
                                selectedColors.includes(color.hex)
                                  ? 'border-foreground'
                                  : 'border-border'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <div className="h-px bg-border" />

                    {/* Price Filter */}
                    <div>
                      <button
                        onClick={() => toggleSection('price')}
                        className="flex items-center justify-between w-full mb-3 text-sm uppercase tracking-wide hover:text-muted-foreground transition-colors"
                      >
                        Giá
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedSections.price ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSections.price && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          {priceRanges.map((range) => (
                            <button
                              key={range.label}
                              onClick={() =>
                                setSelectedPriceRange(
                                  selectedPriceRange === range.label ? null : range.label,
                                )
                              }
                              className={`w-full text-left px-3 py-2 rounded-sm transition-colors ${
                                selectedPriceRange === range.label
                                  ? 'bg-foreground text-background'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={clearFilters}
                      className="w-full border-2 border-border py-3 rounded-sm hover:border-foreground hover:bg-foreground hover:text-background transition-all text-sm uppercase tracking-wide"
                    >
                      Xóa Bộ Lọc
                    </button>
                  </div>
                </ScrollIndicator>
              </div>
            </motion.aside>

            {/* Mobile Filter Sheet */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetContent side="left" className="w-[300px] p-0 overflow-hidden">
                <ScrollIndicator className="h-full" withShadows={true}>
                  <div className="p-6 space-y-6">
                    <SheetHeader>
                      <SheetTitle>Bộ Lọc</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6">
                      {/* Same filter content as desktop - simplified for mobile */}
                      <div>
                        <h3 className="text-sm uppercase mb-3 text-foreground">Size</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => toggleSize(size)}
                              className={`py-2 border rounded-sm transition-all hover:scale-105 ${
                                selectedSizes.includes(size)
                                  ? 'bg-foreground text-background border-foreground'
                                  : 'border-border hover:border-foreground'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Add other filters as needed for mobile */}
                    </div>
                  </div>
                </ScrollIndicator>
              </SheetContent>
            </Sheet>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4] rounded-sm">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 1024px) 50vw, 33vw"
                        />

                        {/* Tag */}
                        <div className="absolute top-4 left-4 bg-background text-foreground px-3 py-1 text-xs font-bold rounded-sm border border-border">
                          {product.tag}
                        </div>

                        {/* Stock Status */}
                        {!product.inStock && (
                          <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 text-xs rounded-sm">
                            HẾT HÀNG
                          </div>
                        )}

                        {/* Quick View Button */}
                        <button
                          className="hidden lg:block absolute bottom-4 left-4 right-4 bg-background text-foreground py-3 text-center opacity-0 group-hover:opacity-100 transition-all hover:bg-muted rounded-sm font-medium border border-border"
                          onClick={(e) => {
                            e.preventDefault()
                            setSelectedProduct(product)
                          }}
                        >
                          Xem Nhanh
                        </button>
                      </div>

                      <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wide">
                        {product.category}
                      </div>
                      <h3 className="mb-2 font-medium group-hover:text-muted-foreground transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{product.price}</span>
                        <div className="flex gap-1">
                          {product.colors.map((color) => (
                            <div
                              key={color.hex}
                              className="w-3 h-3 rounded-full border border-border"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page)
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(currentPage + 1)
                        }}
                        className={
                          currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
          Đang tải...
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  )
}
