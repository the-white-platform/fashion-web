'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/useRouter'
import { AnimatePresence } from 'motion/react'
import {
  ChevronLeft,
  Package,
  Tag,
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { CheckoutProgress } from './components/CheckoutProgress'
import { ShippingStep } from './components/ShippingStep'
import { PaymentStep } from './components/PaymentStep'
import { ReviewStep } from './components/ReviewStep'
import { ConfirmationStep } from './components/ConfirmationStep'

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const tNav = useTranslations('nav')
  const tCart = useTranslations('cart')
  const router = useRouter()
  const { items: cartItems, getTotalPrice, clearCart } = useCart()
  const { user, updateProfile } = useUser()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [orderId, setOrderId] = useState(() => `TW${Date.now()}`)

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      router.push('/products')
    }
  }, [cartItems, router])

  // Shipping info
  const [selectedAddress, setSelectedAddress] = useState<any>(user?.shippingAddresses?.[0] || null)
  const [showNewAddress, setShowNewAddress] = useState(!user?.shippingAddresses?.length)

  // Payment info
  const [selectedPayment, setSelectedPayment] = useState<any>(user?.paymentMethods?.[0] || null)
  const [showNewPayment, setShowNewPayment] = useState(!user?.paymentMethods?.length)

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')

  // Order notes
  const [orderNotes, setOrderNotes] = useState('')

  // Mock coupons
  const mockCoupons = {
    WELCOME10: {
      type: 'percentage',
      value: 10,
      description: t('WELCOME10_desc', { defaultMessage: 'Giảm 10% cho đơn hàng đầu' }),
    },
    FREESHIP: {
      type: 'shipping',
      value: 0,
      description: t('FREESHIP_desc', { defaultMessage: 'Miễn phí vận chuyển' }),
    },
    SAVE50K: {
      type: 'fixed',
      value: 50000,
      description: t('SAVE50K_desc', { defaultMessage: 'Giảm 50.000₫' }),
    },
  }

  const calculateSubtotal = () => getTotalPrice()
  const calculateShipping = () => (appliedCoupon?.type === 'shipping' ? 0 : 30000)
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.type === 'percentage') {
      return calculateSubtotal() * (appliedCoupon.value / 100)
    }
    if (appliedCoupon.type === 'fixed') {
      return appliedCoupon.value
    }
    return 0
  }
  const calculateTotal = () => calculateSubtotal() + calculateShipping() - calculateDiscount()

  const applyCoupon = () => {
    const coupon = mockCoupons[couponCode.toUpperCase() as keyof typeof mockCoupons]
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon })
      setCouponError('')
    } else {
      setCouponError(t('invalidCoupon'))
      setAppliedCoupon(null)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  // Order ID is pre-generated in useState

  const handleCompleteOrder = () => {
    // Add to order history
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      status: 'processing' as const,
      total: calculateTotal(),
      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
        image: item.image,
      })),
      shipping: selectedAddress,
      payment: selectedPayment,
      notes: orderNotes,
      coupon: appliedCoupon,
    }

    // TODO: POST to /api/orders to persist the order
    // updateProfile no longer accepts orderHistory — orders live in the Orders collection
    void newOrder

    clearCart()
    setCurrentStep('confirmation')
  }

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

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ChevronLeft className="w-5 h-5 mr-2" />
          <span>{t('backToCart')}</span>
        </Button>

        {currentStep !== 'confirmation' && (
          <>
            {/* Progress Steps */}
            <CheckoutProgress currentStep={currentStep} />

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {currentStep === 'shipping' && (
                    <ShippingStep
                      key="shipping"
                      user={user}
                      selectedAddress={selectedAddress}
                      onSelectAddress={setSelectedAddress}
                      showNewAddress={showNewAddress}
                      onToggleNewAddress={() => setShowNewAddress(!showNewAddress)}
                      onNext={() => setCurrentStep('payment')}
                    />
                  )}
                  {currentStep === 'payment' && (
                    <PaymentStep
                      key="payment"
                      user={user}
                      selectedPayment={selectedPayment}
                      onSelectPayment={setSelectedPayment}
                      showNewPayment={showNewPayment}
                      onToggleNewPayment={() => setShowNewPayment(!showNewPayment)}
                      total={calculateTotal()}
                      orderId={orderId}
                      onBack={() => setCurrentStep('shipping')}
                      onNext={() => setCurrentStep('review')}
                    />
                  )}
                  {currentStep === 'review' && (
                    <ReviewStep
                      key="review"
                      cartItems={cartItems}
                      selectedAddress={selectedAddress}
                      selectedPayment={selectedPayment}
                      orderNotes={orderNotes}
                      onNotesChange={setOrderNotes}
                      subtotal={calculateSubtotal()}
                      shipping={calculateShipping()}
                      discount={calculateDiscount()}
                      total={calculateTotal()}
                      appliedCoupon={appliedCoupon}
                      onBack={() => setCurrentStep('payment')}
                      onComplete={handleCompleteOrder}
                    />
                  )}
                </AnimatePresence>
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
                    {!appliedCoupon ? (
                      <div className="space-y-2">
                        <Label className="text-sm uppercase tracking-wide">{t('couponCode')}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            onClear={() => setCouponCode('')}
                            placeholder={t('couponPlaceholder')}
                            className="flex-1 text-sm"
                          />
                          <Button onClick={applyCoupon} size="sm">
                            {t('apply')}
                          </Button>
                        </div>
                        {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold">{appliedCoupon.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {appliedCoupon.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeCoupon}
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
                      <span>{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('shippingFee')}</span>
                      <span>
                        {calculateShipping() === 0 ? (
                          <span className="text-green-600">{t('free')}</span>
                        ) : (
                          `${calculateShipping().toLocaleString('vi-VN')}₫`
                        )}
                      </span>
                    </div>
                    {appliedCoupon && calculateDiscount() > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t('discount')}</span>
                        <span>-{calculateDiscount().toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-border flex justify-between">
                      <span className="uppercase tracking-wide">{t('total')}</span>
                      <span className="text-xl font-bold">
                        {calculateTotal().toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="text-xs text-muted-foreground bg-background p-3 rounded-sm border border-border">
                    💡 Mã giảm giá: <span className="font-semibold">WELCOME10</span>,{' '}
                    <span className="font-semibold">FREESHIP</span>,{' '}
                    <span className="font-semibold">SAVE50K</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Confirmation Step */}
        {currentStep === 'confirmation' && (
          <ConfirmationStep
            orderId={orderId}
            total={calculateTotal()}
            selectedPayment={selectedPayment}
            onViewOrders={() => router.push('/orders')}
            onContinueShopping={() => router.push('/products')}
          />
        )}
      </div>
    </div>
  )
}
