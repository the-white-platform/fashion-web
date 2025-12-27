'use client'

import { useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'

import { useTranslations } from 'next-intl'

interface ProductFilterProps {
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  category: string[]
  priceRange: string
  size: string[]
  color: string[]
  sortBy: string
}

export function ProductFilter({ onFilterChange }: ProductFilterProps) {
  const t = useTranslations('filter')
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    priceRange: 'all',
    size: [],
    color: [],
    sortBy: 'newest',
  })

  const categories = [
    { id: 'tshirt', label: t('category.tshirt') },
    { id: 'polo', label: t('category.polo') },
    { id: 'hoodie', label: t('category.hoodie') },
    { id: 'jacket', label: t('category.jacket') },
    { id: 'pants', label: t('category.pants') },
    { id: 'shorts', label: t('category.shorts') },
  ]

  const priceRanges = [
    { id: 'all', label: t('price.all') },
    { id: 'under500', label: t('price.under500') },
    { id: '500-1000', label: t('price.500-1000') },
    { id: '1000-2000', label: t('price.1000-2000') },
    { id: 'above2000', label: t('price.above2000') },
  ]

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const colors = [
    { id: 'white', label: t('color.white'), hex: '#FFFFFF' },
    { id: 'black', label: t('color.black'), hex: '#000000' },
    { id: 'gray', label: t('color.gray'), hex: '#6B7280' },
    { id: 'navy', label: t('color.navy'), hex: '#1E3A8A' },
    { id: 'red', label: t('color.red'), hex: '#DC2626' },
    { id: 'green', label: t('color.green'), hex: '#16A34A' },
  ]

  const sortOptions = [
    { id: 'newest', label: t('sort.newest') },
    { id: 'price-asc', label: t('sort.priceAsc') },
    { id: 'price-desc', label: t('sort.priceDesc') },
    { id: 'popular', label: t('sort.popular') },
  ]

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter((c) => c !== categoryId)
      : [...filters.category, categoryId]

    const newFilters = { ...filters, category: newCategories }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.size.includes(size)
      ? filters.size.filter((s) => s !== size)
      : [...filters.size, size]

    const newFilters = { ...filters, size: newSizes }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleColorToggle = (colorId: string) => {
    const newColors = filters.color.includes(colorId)
      ? filters.color.filter((c) => c !== colorId)
      : [...filters.color, colorId]

    const newFilters = { ...filters, color: newColors }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handlePriceChange = (priceRange: string) => {
    const newFilters = { ...filters, priceRange }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      category: [],
      priceRange: 'all',
      size: [],
      color: [],
      sortBy: 'newest',
    }
    setFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category.length > 0) count += filters.category.length
    if (filters.priceRange !== 'all') count += 1
    if (filters.size.length > 0) count += filters.size.length
    if (filters.color.length > 0) count += filters.color.length
    return count
  }

  const activeCount = getActiveFilterCount()

  return (
    <>
      {/* Filter Toggle Button - Mobile & Desktop */}
      <div className="border-b border-border py-4 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center sm:justify-start gap-2 px-6 py-3 border-2 border-primary uppercase tracking-wide w-full sm:w-auto hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>{t('title')}</span>
              {activeCount > 0 && (
                <Badge
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {activeCount}
                </Badge>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </Button>

            {/* Sort Dropdown - Quick Access */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary uppercase tracking-wide text-sm w-full sm:w-auto bg-background text-foreground"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-muted/30 border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Category Filter */}
                <div>
                  <h3 className="uppercase tracking-wide mb-4 flex items-center justify-between font-medium text-foreground">
                    {t('category.title')}
                    {filters.category.length > 0 && (
                      <Badge
                        variant="default"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {filters.category.length}
                      </Badge>
                    )}
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <Checkbox
                          checked={filters.category.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <span className="text-sm group-hover:text-muted-foreground transition-colors text-foreground">
                          {category.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h3 className="uppercase tracking-wide mb-4 font-medium text-foreground">
                    {t('price.title')}
                  </h3>
                  <RadioGroup
                    value={filters.priceRange}
                    onValueChange={handlePriceChange}
                    className="space-y-2"
                  >
                    {priceRanges.map((range) => (
                      <label
                        key={range.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <RadioGroupItem
                          value={range.id}
                          id={range.id}
                          className="border-primary text-primary"
                        />
                        <span className="text-sm group-hover:text-muted-foreground transition-colors text-foreground">
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Size Filter */}
                <div>
                  <h3 className="uppercase tracking-wide mb-4 flex items-center justify-between font-medium text-foreground">
                    {t('size')}
                    {filters.size.length > 0 && (
                      <Badge
                        variant="default"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {filters.size.length}
                      </Badge>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <Button
                        key={size}
                        variant={filters.size.includes(size) ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handleSizeToggle(size)}
                        className={`w-12 h-12 transition-all ${
                          filters.size.includes(size)
                            ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                            : 'bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h3 className="uppercase tracking-wide mb-4 flex items-center justify-between font-medium text-foreground">
                    {t('color.title')}
                    {filters.color.length > 0 && (
                      <Badge
                        variant="default"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {filters.color.length}
                      </Badge>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorToggle(color.id)}
                        className="relative group outline-none"
                        title={color.label}
                      >
                        <div
                          className={`w-10 h-10 rounded-sm border-2 transition-all ${
                            filters.color.includes(color.id)
                              ? 'border-primary scale-110 shadow-lg'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {filters.color.includes(color.id) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  color.id === 'white' ? 'bg-black' : 'bg-white'
                                }`}
                              />
                            </div>
                          )}
                        </div>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium">
                          {color.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
                <Button variant="ghost" onClick={clearFilters} className="uppercase tracking-wide">
                  {t('clear')}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wide relative overflow-hidden"
                >
                  <span className="relative z-10">{t('apply')}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
