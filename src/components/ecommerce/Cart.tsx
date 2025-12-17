'use client'

import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion, AnimatePresence } from 'motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface CartProps {
  onCheckout?: () => void
}

export function Cart({ onCheckout }: CartProps) {
  const { items, removeFromCart, updateQuantity, getTotalPrice, isCartOpen, setIsCartOpen } =
    useCart()
  const { t } = useLanguage()

  const handleCheckout = () => {
    setIsCartOpen(false)
    if (onCheckout) {
      onCheckout()
    }
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-gray-200">
          <SheetTitle className="text-xl uppercase tracking-wide">
            {t('cart.title')} ({items.length})
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">{t('cart.empty')}</p>
              <p className="text-sm text-gray-400">{t('cart.emptyDesc')}</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 border border-gray-200 rounded-sm"
                  >
                    <div className="relative w-20 h-20 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-sm"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1 font-medium truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">Size: {item.size}</p>
                      <p className="mb-2 font-medium">{item.price.toLocaleString('vi-VN')}₫</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-fit"
                      onClick={() => removeFromCart(item.id, item.size)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="flex-col gap-4 border-t border-gray-200 p-6">
            <div className="flex items-center justify-between text-lg w-full">
              <span>{t('cart.total')}:</span>
              <span className="font-bold">{getTotalPrice().toLocaleString('vi-VN')}₫</span>
            </div>

            <Button
              asChild
              className="w-full bg-black text-white hover:bg-gray-800 uppercase tracking-wide"
              onClick={handleCheckout}
            >
              <Link href="/checkout">{t('cart.checkout')}</Link>
            </Button>

            <Button
              variant="outline"
              className="w-full border-2 border-black hover:bg-black hover:text-white uppercase tracking-wide"
              onClick={() => setIsCartOpen(false)}
            >
              {t('cart.continueShopping')}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
