'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { Search, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/ecommerce/LanguageSwitcher'

export const HeaderNav: React.FC<{ header: HeaderType | null; onSearchOpen: () => void }> = ({
  header,
  onSearchOpen,
}) => {
  const navItems = header?.navItems || []
  const { items, setIsCartOpen } = useCart()
  const { user } = useUser()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {/* Navigation - Desktop */}
      <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
        {navItems.map(({ link }, i) => (
          <CMSLink
            key={i}
            {...link}
            appearance="inline"
            className="hover:text-gray-400 transition-colors tracking-wide uppercase text-sm font-medium text-white"
          />
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        <button
          onClick={onSearchOpen}
          className="p-2 hover:bg-white/10 rounded-sm transition-colors hidden lg:block"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        <Link
          href={user ? '/profile' : '/login'}
          className="p-2 hover:bg-white/10 rounded-sm transition-colors hidden lg:block"
          aria-label={user ? 'Profile' : 'Login'}
        >
          <User className="w-5 h-5" />
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className="p-2 hover:bg-white/10 rounded-sm transition-colors relative"
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
