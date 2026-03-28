'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useTheme } from '@/providers/Theme'

interface AlternatingSectionProps {
  children: ReactNode
  index: number
  className?: string
}

/**
 * Wrapper component that creates alternating light/dark sections that invert with theme.
 *
 * Pattern in LIGHT mode:
 * - index 0 (Carousel): light
 * - index 1 (TakeAction): dark ⭐
 * - index 2 (ProductFilter): light
 * - index 3 (FeaturedProducts): dark
 * - etc.
 *
 * Pattern in DARK mode (INVERTED):
 * - index 0 (Carousel): dark
 * - index 1 (TakeAction): light ⭐
 * - index 2 (ProductFilter): dark
 * - index 3 (FeaturedProducts): light
 * - etc.
 */
export function AlternatingSection({ children, index, className = '' }: AlternatingSectionProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setTimeout(() => setMounted(true), 0)
  }, [])

  // Default to light theme during SSR
  const isGlobalDarkMode = mounted ? theme === 'dark' : false
  const isOdd = index % 2 === 1

  // In light mode: odd sections are dark
  // In dark mode: odd sections are light (inverted)
  let sectionTheme: 'light' | 'dark'
  if (isOdd) {
    sectionTheme = isGlobalDarkMode ? 'light' : 'dark'
  } else {
    sectionTheme = isGlobalDarkMode ? 'dark' : 'light'
  }

  return (
    <div
      className={`relative bg-background text-foreground transition-colors duration-300 ${className}`}
      data-theme={sectionTheme}
      data-section-index={index}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}
