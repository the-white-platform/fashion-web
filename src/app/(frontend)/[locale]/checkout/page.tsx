'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/useRouter'
import { AnimatePresence } from 'motion/react'
import { ChevronLeft, Package, Tag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { useCheckout } from './hooks/useCheckout'
import { useCoupon } from './hooks/useCoupon'
import { CheckoutProgress } from './components/CheckoutProgress'
import { ShippingStep } from './components/ShippingStep'
import { PaymentStep } from './components/PaymentStep'
import { ReviewStep } from './components/ReviewStep'
import { ConfirmationStep } from './components/ConfirmationStep'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const tCart = useTranslations('cart')
  const router = useRouter()
  const { items: cartItems } = useCart()
  const { user } = useUser()

  const checkout = useCheckout()
  const coupon = useCoupon()

  // UI toggle state (local to page — not shared with hooks)
  const [showNewAddress, setShowNewAddress] = useState(!user?.shippingAddresses?.length)
  const [showNewPayment, setShowNewPayment] = useState(!user?.paymentMethods?.length)

  // Guard: redirect if cart is empty (also shows empty state while redirecting)
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl uppercase tracking-wide mb-3">{tCart('empty')}</h2>
            <p className="text-muted-foreground mb-8">{tCart('emptyDesc')}</p>
            <Button onClick={() => router.push('/products')} size="lg">
              {tCart('continueShopping')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Compute coupon-adjusted totals for display and ReviewStep
  const shippingFee = coupon.appliedCoupon?.type === 'shipping' ? 0 : checkout.totals.shipping
  const discount = coupon.appliedCoupon?.discount ?? 0
  const adjustedTotal = checkout.totals.subtotal + shippingFee - discount

  // Derive order ID and total from API result for ConfirmationStep
  const confirmedOrderId: string = checkout.orderResult?.doc?.id ?? checkout.orderResult?.id ?? ''
  const confirmedTotal: number = checkout.orderResult?.doc?.totals?.total ?? adjustedTotal

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ChevronLeft className="w-5 h-5 mr-2" />
          <span>{t('backToCart')}</span>
        </Button>

        {checkout.step !== 'confirmation' && (
          <>
            {/* Progress Steps */}
            <CheckoutProgress currentStep={checkout.step} />

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {checkout.step === 'shipping' && (
                    <ShippingStep
                      key="shipping"
                      user={user}
                      selectedAddress={checkout.selectedAddress}
                      onSelectAddress={checkout.setSelectedAddress}
                      showNewAddress={showNewAddress}
                      onToggleNewAddress={() => setShowNewAddress((prev) => !prev)}
                      onNext={() => checkout.setStep('payment')}
                    />
                  )}
                  {checkout.step === 'payment' && (
                    <PaymentStep
                      key="payment"
                      user={user}
                      selectedPayment={checkout.selectedPayment}
                      onSelectPayment={checkout.setSelectedPayment}
                      showNewPayment={showNewPayment}
                      onToggleNewPayment={() => setShowNewPayment((prev) => !prev)}
                      total={adjustedTotal}
                      orderId={confirmedOrderId || `TW${Date.now()}`}
                      onBack={() => checkout.setStep('shipping')}
                      onNext={() => checkout.setStep('review')}
                    />
                  )}
                  {checkout.step === 'review' && (
                    <ReviewStep
                      key="review"
                      cartItems={cartItems}
                      selectedAddress={checkout.selectedAddress}
                      selectedPayment={checkout.selectedPayment}
                      orderNotes={checkout.orderNotes}
                      onNotesChange={checkout.setOrderNotes}
                      subtotal={checkout.totals.subtotal}
                      shipping={shippingFee}
                      discount={discount}
                      total={adjustedTotal}
                      appliedCoupon={coupon.appliedCoupon}
                      onBack={() => checkout.setStep('payment')}
                      onComplete={() => checkout.completeOrder(coupon.appliedCoupon)}
                    />
                  )}
                </AnimatePresence>

                {/* Order error from API */}
                {checkout.orderError && (
                  <p className="mt-4 text-sm text-red-600 text-center">{checkout.orderError}</p>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-sm p-6 sticky top-24">
                  <h3 className="text-xl uppercase tracking-wide mb-6">{t('orderSummary')}</h3>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="relative w-16 h-20 bg-muted rounded-sm overflow-hidden shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate mb-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                          <p className="text-sm mt-1">
                            {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="mb-6 pb-6 border-b border-border">
                    {!coupon.appliedCoupon ? (
                      <div className="space-y-2">
                        <Label className="text-sm uppercase tracking-wide">{t('couponCode')}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={coupon.couponCode}
                            onChange={(e) => coupon.setCouponCode(e.target.value.toUpperCase())}
                            onClear={() => coupon.setCouponCode('')}
                            placeholder={t('couponPlaceholder')}
                            className="flex-1 text-sm"
                          />
                          <Button
                            onClick={() => coupon.applyCoupon(checkout.totals.subtotal)}
                            size="sm"
                          >
                            {t('apply')}
                          </Button>
                        </div>
                        {coupon.couponError && (
                          <p className="text-xs text-red-600">{coupon.couponError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold">{coupon.appliedCoupon.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {coupon.appliedCoupon.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={coupon.removeCoupon}
                          className="text-red-600 hover:text-red-700"
                        >
                          {t('remove')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('subtotal')}</span>
                      <span>{checkout.totals.subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('shippingFee')}</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-green-600">{t('free')}</span>
                        ) : (
                          `${shippingFee.toLocaleString('vi-VN')}₫`
                        )}
                      </span>
                    </div>
                    {coupon.appliedCoupon && discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t('discount')}</span>
                        <span>-{discount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-border flex justify-between">
                      <span className="uppercase tracking-wide">{t('total')}</span>
                      <span className="text-xl font-bold">
                        {adjustedTotal.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Confirmation Step */}
        {checkout.step === 'confirmation' && (
          <ConfirmationStep
            orderId={confirmedOrderId}
            total={confirmedTotal}
            selectedPayment={checkout.selectedPayment}
            onViewOrders={() => router.push('/orders')}
            onContinueShopping={() => router.push('/products')}
          />
        )}
      </div>
    </div>
  )
}
