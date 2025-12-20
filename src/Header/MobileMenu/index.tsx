'use client'

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, User, ShoppingBag, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/utilities/cn'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { LanguageSwitcher } from '@/components/ecommerce/LanguageSwitcher'

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
            className="fixed inset-0 bg-black/95 z-[60] lg:hidden"
          />

          {/* Menu Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-full w-[85%] max-w-[360px] bg-black text-white z-[70] lg:hidden flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] border-r border-white/10 isolate"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black">
              <div className="flex flex-col">
                <h2 className="text-xl font-black uppercase tracking-widest italic">THEWHITE</h2>
                <span className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">
                  Fashion Laboratory
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-none transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-8 bg-black">
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
                      className="flex items-center justify-between py-4 text-2xl font-black uppercase tracking-tighter italic border-b border-white/5 group hover:text-gray-400 transition-colors"
                    >
                      <span className="relative z-10">{link.label}</span>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
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
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-none"
                  >
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
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
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-none"
                  >
                    <div className="w-10 h-10 bg-black text-white border border-white/20 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Vận chuyển
                      </p>
                      <p className="font-bold uppercase tracking-tight">Theo dõi đơn hàng</p>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-8 border-t border-white/10 bg-black">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                  Ngôn ngữ / Language
                </span>
                <LanguageSwitcher />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
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
