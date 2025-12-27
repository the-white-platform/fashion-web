'use client'

import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

import { motion, AnimatePresence } from 'motion/react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'

import { useTranslations } from 'next-intl'

interface CartProps {
  onCheckout?: () => void
}

export function Cart({ onCheckout }: CartProps) {
  const { items, removeFromCart, updateQuantity, getTotalPrice, isCartOpen, setIsCartOpen } =
    useCart()
  const t = useTranslations('cart')

  const handleCheckout = () => {
    setIsCartOpen(false)
    if (onCheckout) {
      onCheckout()
    }
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="text-xl uppercase tracking-wide">
            {t('title')} ({items.length})
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollIndicator className="h-full" withShadows={true}>
            <div className="p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-foreground mb-2">{t('empty')}</p>
                  <p className="text-sm text-muted-foreground">{t('emptyDesc')}</p>
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
                        className="flex gap-4 p-4 border border-border rounded-sm bg-background"
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
                          <p className="text-sm text-muted-foreground mb-2">Size: {item.size}</p>
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
          </ScrollIndicator>
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="flex-col gap-4 border-t border-border p-6">
            <div className="flex items-center justify-between text-lg w-full">
              <span>{t('total')}:</span>
              <span className="font-bold">{getTotalPrice().toLocaleString('vi-VN')}₫</span>
            </div>

            <Button
              asChild
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wide"
              onClick={handleCheckout}
            >
              <Link href="/checkout">{t('checkout')}</Link>
            </Button>

            <Button
              variant="outline"
              className="w-full border-2 border-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-wide"
              onClick={() => setIsCartOpen(false)}
            >
              {t('continueShopping')}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
