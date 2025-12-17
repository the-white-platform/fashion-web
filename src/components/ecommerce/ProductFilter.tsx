'use client'

import { useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

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
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    priceRange: 'all',
    size: [],
    color: [],
    sortBy: 'newest',
  })

  const categories = [
    { id: 'tshirt', label: t('filter.category.tshirt') },
    { id: 'polo', label: t('filter.category.polo') },
    { id: 'hoodie', label: t('filter.category.hoodie') },
    { id: 'jacket', label: t('filter.category.jacket') },
    { id: 'pants', label: t('filter.category.pants') },
    { id: 'shorts', label: t('filter.category.shorts') },
  ]

  const priceRanges = [
    { id: 'all', label: t('filter.price.all') },
    { id: 'under500', label: t('filter.price.under500') },
    { id: '500-1000', label: t('filter.price.500-1000') },
    { id: '1000-2000', label: t('filter.price.1000-2000') },
    { id: 'above2000', label: t('filter.price.above2000') },
  ]

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const colors = [
    { id: 'white', label: t('filter.color.white'), hex: '#FFFFFF' },
    { id: 'black', label: t('filter.color.black'), hex: '#000000' },
    { id: 'gray', label: t('filter.color.gray'), hex: '#6B7280' },
    { id: 'navy', label: t('filter.color.navy'), hex: '#1E3A8A' },
    { id: 'red', label: t('filter.color.red'), hex: '#DC2626' },
    { id: 'green', label: t('filter.color.green'), hex: '#16A34A' },
  ]

  const sortOptions = [
    { id: 'newest', label: t('filter.sort.newest') },
    { id: 'price-asc', label: t('filter.sort.priceAsc') },
    { id: 'price-desc', label: t('filter.sort.priceDesc') },
    { id: 'popular', label: t('filter.sort.popular') },
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
      <div className="sticky top-20 z-30 bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center sm:justify-start gap-2 px-6 py-3 border-2 border-black uppercase tracking-wide w-full sm:w-auto"
            >
              <Filter className="w-5 h-5" />
              <span>{t('filter.title')}</span>
              {activeCount > 0 && (
                <Badge variant="default" className="bg-black text-white">
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
              className="px-4 py-3 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-black uppercase tracking-wide text-sm w-full sm:w-auto"
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
            className="bg-gray-50 border-b border-gray-200 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Category Filter */}
                <div>
                  <h3 className="uppercase tracking-wide mb-4 flex items-center justify-between">
                    {t('filter.category')}
                    {filters.category.length > 0 && (
                      <Badge variant="default" className="bg-black text-white">
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
                        />
                        <span className="text-sm group-hover:text-gray-600 transition-colors">
                          {category.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h3 className="uppercase tracking-wide mb-4">{t('filter.price')}</h3>
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
                        <RadioGroupItem value={range.id} id={range.id} />
                        <span className="text-sm group-hover:text-gray-600 transition-colors">
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Size Filter */}
                <div>
                  <h3 className="uppercase tracking-wide mb-4 flex items-center justify-between">
                    {t('filter.size')}
                    {filters.size.length > 0 && (
                      <Badge variant="default" className="bg-black text-white">
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
                        className={`w-12 h-12 ${
                          filters.size.includes(size)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h3 className="uppercase tracking-wide mb-4 flex items-center justify-between">
                    {t('filter.color')}
                    {filters.color.length > 0 && (
                      <Badge variant="default" className="bg-black text-white">
                        {filters.color.length}
                      </Badge>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorToggle(color.id)}
                        className="relative group"
                        title={color.label}
                      >
                        <div
                          className={`w-10 h-10 rounded-sm border-2 transition-all ${
                            filters.color.includes(color.id)
                              ? 'border-black scale-110'
                              : 'border-gray-300 hover:border-gray-400'
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
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {color.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                <Button variant="ghost" onClick={clearFilters} className="uppercase tracking-wide">
                  {t('filter.clear')}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-black text-white hover:bg-gray-800 uppercase tracking-wide"
                >
                  {t('filter.apply')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
