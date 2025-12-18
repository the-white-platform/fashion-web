'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { Menu, Search } from 'lucide-react'
import { SearchModal } from '@/components/ecommerce/SearchModal'

interface HeaderClientProps {
  header: Header | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ header }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-black text-white z-40 transition-all duration-300 border-b ${
        isScrolled ? 'shadow-lg border-gray-800' : 'border-transparent'
      }`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu & Search - Left on Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              className="p-2 -ml-2 hover:bg-white/10 rounded-sm transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-white/10 rounded-sm transition-colors"
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
          {header && <HeaderNav header={header} onSearchOpen={() => setIsSearchOpen(true)} />}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
