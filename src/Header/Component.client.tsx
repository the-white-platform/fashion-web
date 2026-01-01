'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { Menu, Search } from 'lucide-react'
import { useModal } from '@/contexts/ModalContext'

interface HeaderClientProps {
  header: Header | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ header }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [mounted, setMounted] = useState(false)
  const { headerTheme, setHeaderTheme, headerHidden } = useHeaderTheme()
  const { theme: globalTheme } = useTheme()
  const pathname = usePathname()
  const { setIsSearchOpen, setIsMobileMenuOpen } = useModal()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => setHeaderTheme(null), [pathname, setHeaderTheme])

  // Use headerTheme if explicitly set, otherwise fall back to global theme
  const effectiveTheme = mounted ? (headerTheme ?? globalTheme) : undefined

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hide header when headerHidden is true (e.g., on checkout page)
  if (headerHidden) {
    return null
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background text-foreground shadow-lg border-b border-border`}
      {...(effectiveTheme ? { 'data-theme': effectiveTheme } : {})}
    >
      <div className="container mx-auto px-4 lg:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Mobile Menu & Search - Left on Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-foreground hover:bg-accent rounded-sm transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-foreground hover:bg-accent rounded-none transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Logo - Center on Mobile, Left on Desktop */}
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start -ml-12 lg:ml-0">
            <Link href="/" className="cursor-pointer">
              <Logo />
            </Link>
          </div>

          {/* Navigation and Actions */}
          <HeaderNav
            isScrolled={isScrolled}
            header={header}
            onSearchOpen={() => setIsSearchOpen(true)}
          />
        </div>
      </div>
    </header>
  )
}
