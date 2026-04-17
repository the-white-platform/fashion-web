'use client'

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Link } from '@/i18n/Link'
import { useTranslations } from 'next-intl'
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/shared/ProductCard'
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
import dynamic from 'next/dynamic'

const ProductModal = dynamic(
  () => import('@/components/ecommerce/ProductModal').then((mod) => mod.ProductModal),
  { ssr: false },
)
import type { ProductForFrontend, CategoryForFrontend } from '@/utilities/getProducts'
import { PageContainer } from '@/components/layout/PageContainer'

interface ProductsPageClientProps {
  initialProducts: ProductForFrontend[]
  categories: CategoryForFrontend[]
  colors: { name: string; hex: string }[]
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2X']

// Price buckets — `i18nKey` selects the localized label; numeric bounds
// drive filtering and stay fixed regardless of locale.
const priceRanges = [
  { i18nKey: 'under500', min: 0, max: 500000 },
  { i18nKey: '500-1000', min: 500000, max: 1000000 },
  { i18nKey: '1000-2000', min: 1000000, max: 2000000 },
  { i18nKey: 'above2000', min: 2000000, max: Infinity },
] as const

function ProductsPageContent({
  allProducts,
  categories,
  colors,
}: {
  allProducts: ProductForFrontend[]
  categories: CategoryForFrontend[]
  colors: { name: string; hex: string }[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize state from URL params
  const getInitialCategory = () => {
    const allName = categories[0]?.name ?? t('allCategory')
    const slug = searchParams.get('category')
    if (slug) {
      const matched = categories.find((cat) => cat.slug === slug)
      return matched?.name || allName
    }
    return allName
  }

  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    const sizes = searchParams.get('sizes')
    return sizes ? sizes.split(',') : []
  })
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    const colorsParam = searchParams.get('colors')
    return colorsParam ? colorsParam.split(',') : []
  })
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory)
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    () => searchParams.get('price') || null,
  )
  const [showInStock, setShowInStock] = useState(() => searchParams.get('inStock') !== 'false')
  const [showOutOfStock, setShowOutOfStock] = useState(
    () => searchParams.get('outOfStock') === 'true',
  )
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '')
  // Tag filter — driven by ?tag= in the URL (e.g. ?tag=hot from the
  // header nav). Read-only on this page; we don't expose a sidebar
  // chip for it yet.
  const tagFilter = (searchParams.get('tag') || '').toLowerCase()

  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'newest')
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page, 10) : 1
  })
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const itemsPerPage = 9

  const t = useTranslations('products')
  const tFilter = useTranslations('filter')
  const allCategoryName = categories[0]?.name ?? t('allCategory')

  // Auto-close the mobile filter drawer when the viewport crosses into
  // desktop (lg = 1024px). Without this the drawer stays mounted behind
  // the desktop sidebar if the user resizes or rotates while it's open.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(min-width: 1024px)')
    const handle = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setShowFilters(false)
    }
    handle(mql)
    mql.addEventListener('change', handle)
    return () => mql.removeEventListener('change', handle)
  }, [])

  const [expandedSections, setExpandedSections] = useState({
    size: true,
    availability: true,
    category: true,
    colors: true,
    price: true,
  })

  // Helper to update URL with new params
  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })

      // Always reset to page 1 when filters change (except for page changes)
      if (!('page' in updates)) {
        newParams.delete('page')
      }

      const queryString = newParams.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  // Handle category selection - updates both state and URL
  const handleCategoryChange = useCallback(
    (categoryName: string) => {
      setSelectedCategory(categoryName)
      setCurrentPage(1)

      const matchedCategory = categories.find((cat) => cat.name === categoryName)
      updateURL({
        category: categoryName === allCategoryName ? null : matchedCategory?.slug || null,
      })
    },
    [categories, updateURL, allCategoryName],
  )

  // Handle sort change
  const handleSortChange = useCallback(
    (value: string) => {
      setSortBy(value)
      setCurrentPage(1)
      updateURL({ sort: value === 'newest' ? null : value })
    },
    [updateURL],
  )

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      updateURL({ page: page === 1 ? null : String(page) })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [updateURL],
  )

  // Handle search — onBlur / Enter path: commits the URL immediately
  // and resets pagination. The debounced effect below also writes to
  // the URL while the user is typing, so deep-linking / browser
  // back / sharing all work without waiting for blur.
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      setCurrentPage(1)
      updateURL({ q: value || null })
    },
    [updateURL],
  )

  // Debounced URL sync as the user types. Uses router.replace (via
  // updateURL is push, so we mirror it here directly with replace) so
  // every keystroke doesn't pile up in history. 400ms keeps the URL
  // close-to-live without thrashing.
  const initialQueryRef = useRef(searchQuery)
  useEffect(() => {
    if (searchQuery === initialQueryRef.current) return
    const t = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams.toString())
      if (searchQuery) {
        newParams.set('q', searchQuery)
      } else {
        newParams.delete('q')
      }
      newParams.delete('page')
      const qs = newParams.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, 400)
    return () => clearTimeout(t)
    // searchParams is intentionally omitted — including it would re-run
    // this effect every time we touch any other filter, which would
    // double-write the q param.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, router, pathname])

  // Handle price range change
  const handlePriceRangeChange = useCallback(
    (label: string | null) => {
      setSelectedPriceRange(label)
      setCurrentPage(1)
      updateURL({ price: label })
    },
    [updateURL],
  )

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size]

    setSelectedSizes(newSizes)
    setCurrentPage(1)
    updateURL({ sizes: newSizes.length > 0 ? newSizes.join(',') : null })
  }

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color]

    setSelectedColors(newColors)
    setCurrentPage(1)
    updateURL({ colors: newColors.length > 0 ? newColors.join(',') : null })
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Filter and sort logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      // Filter by category (check if product belongs to selected category)
      if (selectedCategory !== allCategoryName) {
        if (product.categories && product.categories.length > 0) {
          if (!product.categories.includes(selectedCategory)) return false
        } else if (product.category !== selectedCategory) {
          return false
        }
      }
      if (selectedSizes.length > 0) {
        if (!product.sizes || !product.sizes.some((size) => selectedSizes.includes(size))) {
          return false
        }
      }
      if (selectedColors.length > 0) {
        if (
          !product.colors ||
          !product.colors.some((color) => selectedColors.includes(color.hex))
        ) {
          return false
        }
      }
      if (selectedPriceRange) {
        const range = priceRanges.find((r) => r.i18nKey === selectedPriceRange)
        if (range && (product.priceNumber < range.min || product.priceNumber >= range.max)) {
          return false
        }
      }
      if (!showInStock && product.inStock) return false
      if (!showOutOfStock && !product.inStock) return false
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // ?tag=hot / ?tag=mới / ?tag=sale — substring match on the
      // product's tag string. Lower-case both sides; supports the
      // header nav link for "HOT" and similar one-off entry points.
      if (tagFilter && !(product.tag || '').toLowerCase().includes(tagFilter)) {
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
  }, [
    selectedCategory,
    selectedPriceRange,
    showInStock,
    showOutOfStock,
    searchQuery,
    sortBy,
    selectedSizes,
    selectedColors,
    allProducts,
    tagFilter,
  ])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // handlePageChange is defined above with URL sync

  const inStockCount = allProducts.filter((p) => p.inStock).length
  const outOfStockCount = allProducts.filter((p) => !p.inStock).length

  const clearFilters = () => {
    setSelectedSizes([])
    setSelectedColors([])
    handleCategoryChange(allCategoryName)
    handlePriceRangeChange(null)
    setShowInStock(true)
    setShowOutOfStock(false)
    handleSearchChange('')
  }

  return (
    <PageContainer className="pt-24">
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
                      {t('breadcrumbHome')}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground uppercase tracking-widest text-[10px] font-bold">
                    {t('breadcrumbProducts')}
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
                  {t('heading')}
                </h1>
                <p className="text-muted-foreground max-w-md">{t('description')}</p>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Search, Quick Filters, and Sort Bar */}
        <div className="container mx-auto px-6 mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Search + sort/filter controls. Layout:
                • mobile: search (row 1) then sort + filter side-by-side (row 2, 50/50)
                • sm+:    everything inline in one row
                • lg+:    filter button drops away (desktop sidebar takes over) */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={tFilter('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchChange((e.target as HTMLInputElement).value)
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-sm outline-none focus:border-primary transition-colors text-foreground"
                />
              </div>

              <div className="flex gap-3 sm:gap-4">
                {/* Sort dropdown — equal share of the mobile sort+filter row;
                    shrinks to content on sm+ so it can sit inline with the
                    search bar. */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full bg-muted border border-border px-4 py-3 pr-10 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer uppercase text-xs tracking-wide text-foreground h-full"
                  >
                    <option value="newest">{tFilter('sort.newest')}</option>
                    <option value="price-low">{tFilter('sort.priceAsc')}</option>
                    <option value="price-high">{tFilter('sort.priceDesc')}</option>
                    <option value="popular">{tFilter('sort.popular')}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                </div>

                {/* Mobile Filter Button — equal share of the mobile row,
                    hidden entirely on lg+ where the sidebar filter shows. */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex-1 sm:flex-none lg:hidden bg-primary text-primary-foreground px-5 py-3 flex items-center justify-center gap-2 uppercase tracking-wider text-xs font-bold rounded-sm active:scale-95 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{tFilter('title')}</span>
                </button>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-8 mt-8">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-[280px] shrink-0 self-start sticky top-[200px]"
            >
              <div className="bg-card border border-border rounded-sm h-[calc(100vh-14rem)] overflow-hidden shadow-sm z-10">
                <ScrollIndicator className="h-full" withShadows={true}>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg uppercase tracking-wide">{tFilter('title')}</h2>
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>

                    {/* Size Filter */}
                    <div>
                      <button
                        onClick={() => toggleSection('size')}
                        className="flex items-center justify-between w-full mb-3 text-sm uppercase tracking-wide hover:text-muted-foreground transition-colors"
                      >
                        {tFilter('size')}
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
                        {tFilter('stockStatus.title')}
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
                              {tFilter('stockStatus.inStock')}{' '}
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
                              {tFilter('stockStatus.outOfStock')}{' '}
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
                        {tFilter('category.title')}
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
                              onClick={() => handleCategoryChange(cat.name)}
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
                        {tFilter('color.title')}
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
                        {tFilter('price.title')}
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
                              key={range.i18nKey}
                              onClick={() =>
                                handlePriceRangeChange(
                                  selectedPriceRange === range.i18nKey ? null : range.i18nKey,
                                )
                              }
                              className={`w-full text-left px-3 py-2 rounded-sm transition-colors ${
                                selectedPriceRange === range.i18nKey
                                  ? 'bg-foreground text-background'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {tFilter(`price.${range.i18nKey}` as const)}
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
                      {tFilter('clear')}
                    </button>
                  </div>
                </ScrollIndicator>
              </div>
            </motion.aside>

            {/* Mobile Filter Sheet — mirrors the desktop sidebar. Sections are
                always expanded (no collapsing) so the drawer reads as one
                scrollable list. Action handlers are shared with the desktop
                sidebar so the URL/state stay in sync either way. */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetContent side="left" className="w-[300px] p-0 overflow-hidden">
                <ScrollIndicator className="h-full" withShadows={true}>
                  <div className="p-6 space-y-6">
                    <SheetHeader>
                      <SheetTitle>{tFilter('title')}</SheetTitle>
                    </SheetHeader>

                    {/* Size */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide mb-3">{tFilter('size')}</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`py-2 border rounded-sm transition-all active:scale-95 ${
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

                    <div className="h-px bg-border" />

                    {/* Availability */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide mb-3">
                        {tFilter('stockStatus.title')}
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={showInStock}
                            onChange={(e) => setShowInStock(e.target.checked)}
                            className="w-4 h-4 rounded-sm border-2 border-border text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-0 cursor-pointer accent-foreground"
                          />
                          <span className="group-hover:text-muted-foreground transition-colors">
                            {tFilter('stockStatus.inStock')}{' '}
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
                            {tFilter('stockStatus.outOfStock')}{' '}
                            <span className="text-muted-foreground">({outOfStockCount})</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Category */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide mb-3">
                        {tFilter('category.title')}
                      </h3>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.name}
                            onClick={() => handleCategoryChange(cat.name)}
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
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Colors */}
                    {colors.length > 0 && (
                      <>
                        <div>
                          <h3 className="text-sm uppercase tracking-wide mb-3">
                            {tFilter('color.title')}
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            {colors.map((color) => (
                              <button
                                key={color.hex}
                                onClick={() => toggleColor(color.hex)}
                                className={`w-10 h-10 rounded-sm border-2 transition-all ${
                                  selectedColors.includes(color.hex)
                                    ? 'border-foreground'
                                    : 'border-border'
                                }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-border" />
                      </>
                    )}

                    {/* Price */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide mb-3">
                        {tFilter('price.title')}
                      </h3>
                      <div className="space-y-2">
                        {priceRanges.map((range) => (
                          <button
                            key={range.i18nKey}
                            onClick={() =>
                              handlePriceRangeChange(
                                selectedPriceRange === range.i18nKey ? null : range.i18nKey,
                              )
                            }
                            className={`w-full text-left px-3 py-2 rounded-sm transition-colors ${
                              selectedPriceRange === range.i18nKey
                                ? 'bg-foreground text-background'
                                : 'hover:bg-muted'
                            }`}
                          >
                            {tFilter(`price.${range.i18nKey}` as const)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear */}
                    <button
                      onClick={clearFilters}
                      className="w-full border-2 border-border py-3 rounded-sm hover:border-foreground hover:bg-foreground hover:text-background transition-all text-sm uppercase tracking-wide"
                    >
                      {tFilter('clear')}
                    </button>
                  </div>
                </ScrollIndicator>
              </SheetContent>
            </Sheet>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {currentProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onQuickView={(p) => setSelectedProduct(p)}
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
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

                    {/* Smart pagination with ellipsis */}
                    {(() => {
                      const pages: (number | 'ellipsis')[] = []
                      const showEllipsis = totalPages > 7

                      if (!showEllipsis) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        // Always show first page
                        pages.push(1)

                        // Calculate range around current page
                        const start = Math.max(2, currentPage - 1)
                        const end = Math.min(totalPages - 1, currentPage + 1)

                        // Add ellipsis after first page if needed
                        if (start > 2) {
                          pages.push('ellipsis')
                        }

                        // Add pages around current page
                        for (let i = start; i <= end; i++) {
                          pages.push(i)
                        }

                        // Add ellipsis before last page if needed
                        if (end < totalPages - 1) {
                          pages.push('ellipsis')
                        }

                        // Always show last page
                        pages.push(totalPages)
                      }

                      return pages.map((page, index) => {
                        if (page === 'ellipsis') {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <span className="px-4 py-2">...</span>
                            </PaginationItem>
                          )
                        }

                        return (
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
                        )
                      })
                    })()}

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
        ```
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </PageContainer>
  )
}

function ProductsLoadingFallback() {
  const t = useTranslations('products')
  return (
    <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
      {t('loading')}
    </div>
  )
}

export default function ProductsPageClient({
  initialProducts,
  categories,
  colors,
}: ProductsPageClientProps) {
  return (
    <Suspense fallback={<ProductsLoadingFallback />}>
      <ProductsPageContent allProducts={initialProducts} categories={categories} colors={colors} />
    </Suspense>
  )
}
