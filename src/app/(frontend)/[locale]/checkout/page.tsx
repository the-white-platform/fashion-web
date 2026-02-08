'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/useRouter'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronLeft, CreditCard, Truck, Package, Plus, Tag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/Link'

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const tNav = useTranslations('nav')
  const tCart = useTranslations('cart')
  const router = useRouter()
  const { items: cartItems, getTotalPrice, clearCart } = useCart()
  const { user, updateProfile } = useUser()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [orderId, setOrderId] = useState('')

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

  // Pre-generate order ID if not exists
  useEffect(() => {
    if (!orderId) {
      setOrderId(`TW${Date.now()}`)
    }
  }, [orderId])

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

    const updatedOrderHistory = [...(user?.orderHistory || []), newOrder]
    updateProfile({ orderHistory: updatedOrderHistory })

    clearCart()
    setCurrentStep('confirmation')
  }

  const steps: Array<{ id: CheckoutStep; label: string; icon: any }> = [
    { id: 'shipping', label: t('shipping'), icon: Truck },
    { id: 'payment', label: t('payment'), icon: CreditCard },
    { id: 'review', label: t('review'), icon: Package },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

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
            <div className="mb-12">
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = index < currentStepIndex
                  const isCurrent = step.id === currentStep

                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-12 h-12 rounded-sm border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-foreground border-foreground text-background'
                              : isCurrent
                                ? 'border-foreground text-foreground'
                                : 'border-border text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-sm uppercase tracking-wide ${
                            isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-4 transition-all ${
                            index < currentStepIndex ? 'bg-foreground' : 'bg-border'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

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

// Shipping Step Component
function ShippingStep({
  user,
  selectedAddress,
  onSelectAddress,
  showNewAddress,
  onToggleNewAddress,
  onNext,
}: any) {
  const t = useTranslations('checkout')
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  })

  const handleNext = () => {
    if (!selectedAddress && !showNewAddress) {
      alert(t('address'))
      return
    }
    if (showNewAddress) {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city) {
        alert(t('address'))
        return
      }
      onSelectAddress(newAddress)
    }
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-card border border-border rounded-sm p-8"
    >
      <h2 className="text-2xl uppercase tracking-wide mb-6">{t('shipping')}</h2>

      {/* Saved Addresses */}
      {user?.shippingAddresses && user.shippingAddresses.length > 0 && !showNewAddress && (
        <div className="space-y-4 mb-6">
          {user.shippingAddresses.map((address: any, index: number) => (
            <label
              key={index}
              className={`block p-4 border-2 rounded-sm cursor-pointer transition-all ${
                selectedAddress === address
                  ? 'border-foreground bg-background'
                  : 'border-border hover:border-foreground'
              }`}
            >
              <RadioGroup>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={String(index)} checked={selectedAddress === address} />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{address.fullName}</p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.address}
                      {address.ward && `, ${address.ward}`}
                      {address.district && `, ${address.district}`}
                      {address.city && `, ${address.city}`}
                    </p>
                    {address.isDefault && (
                      <Badge variant="secondary" className="mt-2">
                        {t('default')}
                      </Badge>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </label>
          ))}
        </div>
      )}

      {/* New Address Form */}
      {showNewAddress && (
        <div className="space-y-4 mb-6">
          <div>
            <Label>{t('fullName')} *</Label>
            <Input
              value={newAddress.fullName}
              onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
              placeholder={t('namePlaceholder')}
              required
            />
          </div>
          <div>
            <Label>{t('phone')} *</Label>
            <Input
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              placeholder={t('phonePlaceholder')}
              required
            />
          </div>
          <div>
            <Label>{t('address')} *</Label>
            <Input
              value={newAddress.address}
              onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              placeholder={t('addressPlaceholder')}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t('ward')}</Label>
              <Input
                value={newAddress.ward}
                onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('district')}</Label>
              <Input
                value={newAddress.district}
                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('city')} *</Label>
              <Input
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder={t('cityPlaceholder')}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Toggle New Address */}
      {user?.shippingAddresses && user.shippingAddresses.length > 0 && (
        <Button variant="ghost" onClick={onToggleNewAddress} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          {showNewAddress ? t('useSavedAddress') : t('addNewAddress')}
        </Button>
      )}

      {/* Action Button */}
      <Button onClick={handleNext} className="w-full" size="lg">
        {t('next')}
      </Button>
    </motion.div>
  )
}

// Payment Step Component
function PaymentStep({
  user,
  selectedPayment,
  onSelectPayment,
  showNewPayment,
  onToggleNewPayment,
  total,
  orderId,
  onBack,
  onNext,
}: any) {
  const t = useTranslations('checkout')
  const [newPayment, setNewPayment] = useState({
    type: 'bank' as 'bank' | 'cod',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })

  const handleNext = () => {
    if (!selectedPayment && !showNewPayment) {
      alert(t('selectPayment'))
      return
    }
    if (showNewPayment) {
      onSelectPayment(newPayment)
    }
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-card border border-border rounded-sm p-8"
    >
      <h2 className="text-2xl uppercase tracking-wide mb-6">{t('payment')}</h2>

      {/* Saved Payment Methods */}
      {user?.paymentMethods && user.paymentMethods.length > 0 && !showNewPayment && (
        <div className="space-y-4 mb-6">
          {user.paymentMethods.map((method: any, index: number) => (
            <label
              key={index}
              className={`block p-4 border-2 rounded-sm cursor-pointer transition-all ${
                selectedPayment === method
                  ? 'border-foreground bg-background'
                  : 'border-border hover:border-foreground'
              }`}
            >
              <RadioGroup>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={String(index)} checked={selectedPayment === method} />
                  <div>
                    <p className="font-semibold">
                      {method.type === 'card' && `💳 ${t('paymentMethods.card')}`}
                      {method.type === 'bank' && `🏦 ${t('paymentMethods.bank')}`}
                      {method.type === 'cod' && `💵 ${t('paymentMethods.cod')}`}
                      {method.type === 'momo' && `📱 ${t('paymentMethods.momo')}`}
                    </p>
                    {method.type === 'card' && method.cardNumber && (
                      <p className="text-sm text-muted-foreground">
                        •••• •••• •••• {method.cardNumber.slice(-4)}
                      </p>
                    )}
                    {method.isDefault && (
                      <Badge variant="secondary" className="mt-1">
                        {t('default')}
                      </Badge>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </label>
          ))}
        </div>
      )}

      {/* New Payment Form */}
      {showNewPayment && (
        <div className="space-y-4 mb-6">
          {/* Payment Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {['bank', 'cod'].map((type) => (
              <Button
                key={type}
                variant={newPayment.type === type ? 'default' : 'outline'}
                onClick={() => setNewPayment({ ...newPayment, type: type as any })}
                className="p-4 h-auto flex-col"
              >
                <span className="text-lg mb-1">
                  {type === 'card' && '💳 Thẻ'}
                  {type === 'bank' && '🏦 QR'}
                  {type === 'momo' && '📱 MoMo'}
                  {type === 'cod' && '💵 COD'}
                </span>
                <span className="text-sm">
                  {type === 'bank' && t('paymentMethods.bank')}
                  {type === 'cod' && t('paymentMethods.cod')}
                </span>
              </Button>
            ))}
          </div>

          {newPayment.type === 'bank' && (
            <div className="bg-primary/5 border border-primary/20 rounded-sm p-6 text-primary">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm shrink-0">
                  <Image
                    src={`https://img.vietqr.io/image/VCB-kanetran29-compact2.png?amount=${total}&addInfo=${orderId}&accountName=KANE%20TRAN`}
                    alt="VietQR"
                    width={280}
                    height={280}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm mb-3 font-bold uppercase tracking-wider text-primary">
                    🏦 {t('bankTransferQR')}
                  </p>
                  <div className="space-y-1 text-sm text-foreground">
                    <p>
                      <span className="text-muted-foreground">{t('bank')}:</span>{' '}
                      <strong>Vietcombank</strong>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t('accountNumber')}:</span>{' '}
                      <strong>kanetran29</strong>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t('amount')}:</span>{' '}
                      <strong>{total.toLocaleString('vi-VN')}₫</strong>
                    </p>
                    <p className="p-2 bg-primary/10 rounded-sm mt-2 font-mono text-xs border border-primary/20">
                      <span className="text-muted-foreground">{t('content')}:</span>{' '}
                      <strong>{orderId}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] mt-4 italic text-muted-foreground text-center">
                {t('qrNote')}
              </p>
            </div>
          )}

          {newPayment.type === 'cod' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-sm p-4 text-yellow-600 dark:text-yellow-500">
              <p className="text-sm">{t('codNote')}</p>
            </div>
          )}
        </div>
      )}

      {/* Toggle New Payment */}
      {user?.paymentMethods && user.paymentMethods.length > 0 && (
        <Button variant="ghost" onClick={onToggleNewPayment} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          {showNewPayment ? t('useSavedPayment') : t('addNewPayment')}
        </Button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t('back')}
        </Button>
        <Button onClick={handleNext} className="flex-1">
          {t('next')}
        </Button>
      </div>
    </motion.div>
  )
}

// Review Step Component
function ReviewStep({
  cartItems,
  selectedAddress,
  selectedPayment,
  orderNotes,
  onNotesChange,
  subtotal,
  shipping,
  discount,
  total,
  appliedCoupon,
  onBack,
  onComplete,
}: any) {
  const t = useTranslations('checkout')
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Order Items */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">
          {t('items')} ({cartItems.length})
        </h3>
        <div className="space-y-4">
          {cartItems.map((item: any, index: number) => (
            <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0">
              <div className="relative w-20 h-24 bg-muted rounded-sm overflow-hidden shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <p className="mb-1">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t('size')}: {item.size}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('quantity')}: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">{t('shipping')}</h3>
        {selectedAddress && (
          <div>
            <p className="font-semibold mb-1">{selectedAddress.fullName}</p>
            <p className="text-sm text-muted-foreground">{selectedAddress.phone}</p>
            <p className="text-sm text-muted-foreground">
              {selectedAddress.address}
              {selectedAddress.ward && `, ${selectedAddress.ward}`}
              {selectedAddress.district && `, ${selectedAddress.district}`}
              {selectedAddress.city && `, ${selectedAddress.city}`}
            </p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">{t('payment')}</h3>
        {selectedPayment && (
          <div>
            <p className="font-semibold">
              {selectedPayment.type === 'card' && `💳 ${t('paymentMethods.card')}`}
              {selectedPayment.type === 'bank' && `🏦 ${t('paymentMethods.bank')}`}
              {selectedPayment.type === 'cod' && `💵 ${t('paymentMethods.cod')}`}
              {selectedPayment.type === 'momo' && `📱 ${t('paymentMethods.momo')}`}
            </p>
            {selectedPayment.type === 'card' && selectedPayment.cardNumber && (
              <p className="text-sm text-muted-foreground">
                •••• •••• •••• {selectedPayment.cardNumber.slice(-4)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Order Notes */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">{t('orderNotes')}</h3>
        <Textarea
          value={orderNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t('orderNotesPlaceholder')}
          rows={4}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t('back')}
        </Button>
        <Button onClick={onComplete} className="flex-1" size="lg">
          {t('placeOrder')}
        </Button>
      </div>
    </motion.div>
  )
}

// Confirmation Step Component
function ConfirmationStep({
  orderId,
  total,
  selectedPayment,
  onViewOrders,
  onContinueShopping,
}: {
  orderId: string
  total: number
  selectedPayment: any
  onViewOrders: () => void
  onContinueShopping: () => void
}) {
  const t = useTranslations('checkout')
  const tNav = useTranslations('nav')
  const isBankTransfer = selectedPayment?.type === 'bank'
  const qrUrl = `https://img.vietqr.io/image/VCB-kanetran29-compact2.png?amount=${total}&addInfo=${orderId}&accountName=KANE%20TRAN`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center py-12"
    >
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-500" />
      </div>

      <h1 className="text-3xl uppercase tracking-wide mb-4">{t('success')}</h1>
      <p className="text-muted-foreground mb-8">{t('successDesc')}</p>

      {isBankTransfer && (
        <div className="bg-card border-2 border-primary/20 rounded-sm p-8 mb-8 shadow-xl">
          <h2 className="text-xl uppercase tracking-widest mb-6 font-bold flex items-center justify-center gap-2">
            <span className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-xs">
              1
            </span>
            {t('qrTitle')}
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-10 justify-center mb-6">
            <div className="bg-white p-6 rounded-lg shadow-inner">
              <Image
                src={qrUrl}
                alt="QR Code thanh toán"
                width={320}
                height={320}
                className="mx-auto"
              />
            </div>
            <div className="text-left space-y-4 max-w-xs">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t('accountHolder')}
                </p>
                <p className="font-bold uppercase tracking-wide">KANE TRAN</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t('accountNumber')}
                </p>
                <p className="font-bold text-lg">kanetran29</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t('bank')}
                </p>
                <p className="font-bold">Vietcombank (VCB)</p>
              </div>
              <div className="p-3 bg-muted rounded-sm border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t('content')}
                </p>
                <p className="font-mono font-bold text-primary">{orderId}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">{t('qrNote')}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-sm p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('orderId')}</p>
            <p className="text-xl font-bold">{orderId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('total')}</p>
            <p className="text-xl font-bold">{total.toLocaleString('vi-VN')}₫</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8 text-muted-foreground">
        <p className="text-sm">📧 {t('successEmail')}</p>
        <p className="text-sm">📦 {t('successTrack')}</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onContinueShopping} className="flex-1" size="lg">
          {tNav('products')}
        </Button>
        <Button onClick={onViewOrders} className="flex-1" size="lg">
          {t('viewOrders')}
        </Button>
      </div>
    </motion.div>
  )
}
