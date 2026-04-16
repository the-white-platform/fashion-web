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
  const tCoupon = useTranslations('coupon')
  const router = useRouter()
  const { items: cartItems } = useCart()
  const { user } = useUser()

  const checkout = useCheckout()
  const coupon = useCoupon()

  // Generate the human-readable orderNumber up-front so the VietQR memo
  // shown on PaymentStep matches the ID saved in the DB and shown on
  // ConfirmationStep. Format mirrors the server-side fallback in
  // Orders.beforeChange (TW-{timestamp-b36}-{random}).
  const [pendingOrderNumber] = useState<string>(() => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `TW-${timestamp}-${random}`
  })

  // UI toggle state (local to page — not shared with hooks)
  const [showNewAddress, setShowNewAddress] = useState(!user?.shippingAddresses?.length)
  const [showNewPayment, setShowNewPayment] = useState(!user?.paymentMethods?.length)

  // Guard: empty cart → show an empty-state screen. Skip the guard once
  // we've hit the confirmation step — by then `completeOrder` has
  // intentionally cleared the cart and we want the success screen to
  // render, not the "empty cart" one.
  if ((!cartItems || cartItems.length === 0) && checkout.step !== 'confirmation') {
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
  const pointsDiscount = checkout.totals.pointsDiscount ?? 0
  const adjustedTotal = Math.max(
    0,
    checkout.totals.subtotal + shippingFee - discount - pointsDiscount,
  )

  // Derive total from API result for ConfirmationStep; orderNumber is the
  // client-generated one we already committed to the server, so it stays
  // identical between payment (QR memo) and confirmation screens.
  const confirmedOrderNumber: string = checkout.orderResult?.doc?.orderNumber ?? pendingOrderNumber
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
                      orderId={pendingOrderNumber}
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
                      onComplete={() =>
                        checkout.completeOrder(coupon.appliedCoupon, undefined, pendingOrderNumber)
                      }
                      pointsAvailable={checkout.pointsAvailable}
                      pointsToRedeem={checkout.pointsToRedeem}
                      onPointsChange={checkout.setPointsToRedeem}
                      pointsDiscount={pointsDiscount}
                    />
                  )}
                </AnimatePresence>

                {/* Order error from API */}
                {checkout.orderError && (
                  <p className="mt-4 text-sm text-destructive text-center">{checkout.orderError}</p>
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
                          <p className="text-xs text-destructive">
                            {tCoupon(coupon.couponError as any)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-success" />
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
                          className="text-destructive hover:text-destructive/90"
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
                          <span className="text-success">{t('free')}</span>
                        ) : (
                          `${shippingFee.toLocaleString('vi-VN')}₫`
                        )}
                      </span>
                    </div>
                    {coupon.appliedCoupon && discount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>{t('discount')}</span>
                        <span>-{discount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                    {pointsDiscount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Điểm thưởng ({checkout.pointsToRedeem} điểm)</span>
                        <span>-{pointsDiscount.toLocaleString('vi-VN')}₫</span>
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
            orderId={confirmedOrderNumber}
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
