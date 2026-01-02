'use client'

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, User, ShoppingBag, ChevronRight, Search } from 'lucide-react'
import { Link } from '@/i18n/Link'
import { cn } from '@/utilities/cn'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { LanguageSwitcher } from '@/components/ecommerce/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ecommerce/ThemeSwitcher'
import { Logo } from '@/components/Logo/Logo'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  header: HeaderType | null
  user: any
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, header, user }) => {
  const navItems = header?.navItems || []
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/95 z-[60] lg:hidden"
          />

          {/* Menu Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-full w-[85%] max-w-[360px] bg-background text-foreground z-[70] lg:hidden flex flex-col shadow-2xl border-r border-border isolate"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <Link href="/" onClick={onClose} className="cursor-pointer">
                <Logo className="items-start" />
              </Link>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-accent hover:bg-accent/80 rounded-none transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-8 bg-background">
              <ul className="px-6 space-y-2">
                {navItems.map(({ link }, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <CMSLink
                      {...link}
                      onClick={onClose}
                      className="flex items-center justify-between py-4 text-2xl font-black uppercase tracking-tighter italic border-b border-border group hover:text-muted-foreground transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </CMSLink>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 px-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href={user ? '/profile' : '/login'}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 bg-card border border-border hover:bg-accent transition-all rounded-none"
                  >
                    <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        Tài khoản
                      </p>
                      <p className="font-bold uppercase tracking-tight">
                        {user ? 'Hồ sơ cá nhân' : 'Đăng nhập / Đăng ký'}
                      </p>
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/order-tracking"
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 bg-card border border-border hover:bg-accent transition-all rounded-none"
                  >
                    <div className="w-10 h-10 bg-primary text-primary-foreground border border-primary-foreground/20 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        Vận chuyển
                      </p>
                      <p className="font-bold uppercase tracking-tight">Theo dõi đơn hàng</p>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-8 border-t border-border bg-background">
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Ngôn ngữ / Language
                  </span>
                  <LanguageSwitcher />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Giao diện / Theme
                  </span>
                  <ThemeSwitcher />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                  TheWhite Platform © 2025
                  <br />
                  Premium Sportswear Laboratory
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Don't render on server
  if (!mounted) return null

  // Render the menu in a portal at the document body level
  // This ensures proper z-index stacking without being limited by parent containers
  return ReactDOM.createPortal(menuContent, document.body)
}
