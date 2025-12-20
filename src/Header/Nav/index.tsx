'use client'

import React from 'react'
import { cn } from '@/utilities/cn'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { Search, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/ecommerce/LanguageSwitcher'

export const HeaderNav: React.FC<{
  header: HeaderType | null
  onSearchOpen: () => void
  isScrolled?: boolean
}> = ({ header, onSearchOpen, isScrolled }) => {
  const navItems = header?.navItems || []
  const { items, setIsCartOpen } = useCart()
  const { user } = useUser()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // Default navigation items as fallback
  const defaultNavItems = [
    { label: 'Nam', url: '/products?category=men' },
    { label: 'Nữ', url: '/products?category=women' },
    { label: 'Trẻ Em', url: '/products?category=kids' },
    { label: 'Mới Nhất', url: '/products?sort=newest' },
  ]

  const displayNavItems = navItems.length > 0 ? navItems : defaultNavItems

  return (
    <>
      {/* Navigation - Desktop */}
      <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
        {displayNavItems.map((item, i) => {
          // Handle both CMS items and default items
          if ('link' in item) {
            // CMS item
            return (
              <CMSLink
                key={i}
                {...item.link}
                appearance="inline"
                className={cn(
                  'hover:text-gray-400 transition-all tracking-wide uppercase text-sm font-medium text-white',
                  !isScrolled && 'drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]',
                )}
              />
            )
          } else {
            // Default item
            return (
              <Link
                key={i}
                href={item.url}
                className={cn(
                  'hover:text-gray-400 transition-all tracking-wide uppercase text-sm font-medium text-white',
                  !isScrolled && 'drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]',
                )}
              >
                {item.label}
              </Link>
            )
          }
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4 text-white">
        <button
          onClick={onSearchOpen}
          className={cn(
            'p-2 hover:bg-white/10 rounded-sm transition-all hidden lg:block',
            !isScrolled && 'drop-shadow-lg',
          )}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        <Link
          href={user ? '/profile' : '/login'}
          className={cn(
            'p-2 hover:bg-white/10 rounded-sm transition-all hidden lg:block',
            !isScrolled && 'drop-shadow-lg',
          )}
          aria-label={user ? 'Profile' : 'Login'}
        >
          <User className="w-5 h-5" />
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className={cn(
            'p-2 hover:bg-white/10 rounded-sm transition-all relative',
            !isScrolled && 'drop-shadow-lg',
          )}
          aria-label="Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold w-4 h-4 lg:w-5 lg:h-5 rounded-sm flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
        <div className="hidden lg:block">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  )
}
