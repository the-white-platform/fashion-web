'use client'

import React from 'react'
import { cn } from '@/utilities/cn'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/shared/Link'
import { Search, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/ecommerce/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ecommerce/ThemeSwitcher'

export const HeaderNav: React.FC<{
  header: HeaderType | null
  onSearchOpen: () => void
  isScrolled?: boolean
}> = ({ header, onSearchOpen, isScrolled }) => {
  const navItems = header?.navItems || []
  const { items, setIsCartOpen } = useCart()
  const { user } = useUser()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {/* Navigation - Desktop — pure CMS. Admin owns /admin/globals/header
          navItems; no in-code fallback. If the array is empty the nav
          renders nothing (matches the carousel / featured-products /
          activity-categories pattern). */}
      <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
        {navItems.map((item, i) => (
          <CMSLink
            key={i}
            {...item.link}
            appearance="inline"
            className={cn(
              'hover:text-muted-foreground transition-all tracking-wide uppercase text-sm font-medium text-foreground',
              !isScrolled && 'drop-shadow-sm',
            )}
          />
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4 text-foreground">
        <button
          onClick={onSearchOpen}
          className={cn(
            'p-2 hover:bg-accent rounded-sm transition-all hidden lg:block',
            !isScrolled && 'drop-shadow-lg',
          )}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        <Link
          href={user ? '/profile' : '/login'}
          className={cn(
            'p-2 hover:bg-accent rounded-sm transition-all hidden lg:block',
            !isScrolled && 'drop-shadow-lg',
          )}
          aria-label={user ? t('nav.profile') : t('nav.login')}
        >
          <User className="w-5 h-5" />
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className={cn(
            'p-2 hover:bg-accent rounded-sm transition-all relative',
            !isScrolled && 'drop-shadow-lg',
          )}
          aria-label={t('nav.cart')}
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold w-4 h-4 lg:w-5 lg:h-5 rounded-sm flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
        <div className="hidden lg:flex items-center gap-4">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </>
  )
}
