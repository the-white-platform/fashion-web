'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronLeft, CreditCard, Truck, Package, MapPin, Plus, Tag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

export default function CheckoutPage() {
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
      description: 'Giảm 10% cho đơn hàng đầu',
    },
    FREESHIP: { type: 'shipping', value: 0, description: 'Miễn phí vận chuyển' },
    SAVE50K: { type: 'fixed', value: 50000, description: 'Giảm 50.000₫' },
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
      setCouponError('Mã giảm giá không hợp lệ')
      setAppliedCoupon(null)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleCompleteOrder = () => {
    const newOrderId = `TW${Date.now()}`
    setOrderId(newOrderId)

    // Add to order history
    const newOrder = {
      id: newOrderId,
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
    { id: 'shipping', label: 'Giao Hàng', icon: Truck },
    { id: 'payment', label: 'Thanh Toán', icon: CreditCard },
    { id: 'review', label: 'Xác Nhận', icon: Package },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl uppercase tracking-wide mb-3">Giỏ Hàng Trống</h2>
            <p className="text-gray-600 mb-8">
              Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán
            </p>
            <Button onClick={() => router.push('/products')} size="lg">
              Tiếp Tục Mua Sắm
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ChevronLeft className="w-5 h-5 mr-2" />
          <span>Quay lại giỏ hàng</span>
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
                              ? 'bg-black border-black text-white'
                              : isCurrent
                                ? 'border-black text-black'
                                : 'border-gray-300 text-gray-400'
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
                            isCompleted || isCurrent ? 'text-black' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-4 transition-all ${
                            index < currentStepIndex ? 'bg-black' : 'bg-gray-300'
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
                <div className="bg-gray-50 rounded-sm p-6 sticky top-24">
                  <h3 className="text-xl uppercase tracking-wide mb-6">Đơn Hàng</h3>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="relative w-16 h-20 bg-gray-200 rounded-sm overflow-hidden shrink-0">
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
                          <p className="text-xs text-gray-600">Size: {item.size}</p>
                          <p className="text-sm mt-1">
                            {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    {!appliedCoupon ? (
                      <div className="space-y-2">
                        <Label className="text-sm uppercase tracking-wide">Mã Giảm Giá</Label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã"
                            className="flex-1 text-sm"
                          />
                          <Button onClick={applyCoupon} size="sm">
                            Áp Dụng
                          </Button>
                        </div>
                        {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold">{appliedCoupon.code}</p>
                            <p className="text-xs text-gray-600">{appliedCoupon.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeCoupon}
                          className="text-red-600 hover:text-red-700"
                        >
                          Xóa
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span>{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span>
                        {calculateShipping() === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          `${calculateShipping().toLocaleString('vi-VN')}₫`
                        )}
                      </span>
                    </div>
                    {appliedCoupon && calculateDiscount() > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá</span>
                        <span>-{calculateDiscount().toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-300 flex justify-between">
                      <span className="uppercase tracking-wide">Tổng cộng</span>
                      <span className="text-xl font-bold">
                        {calculateTotal().toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="text-xs text-gray-600 bg-white p-3 rounded-sm">
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
      alert('Vui lòng chọn địa chỉ giao hàng')
      return
    }
    if (showNewAddress) {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city) {
        alert('Vui lòng điền đầy đủ thông tin địa chỉ')
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
      className="bg-gray-50 rounded-sm p-8"
    >
      <h2 className="text-2xl uppercase tracking-wide mb-6">Địa Chỉ Giao Hàng</h2>

      {/* Saved Addresses */}
      {user?.shippingAddresses && user.shippingAddresses.length > 0 && !showNewAddress && (
        <div className="space-y-4 mb-6">
          {user.shippingAddresses.map((address: any, index: number) => (
            <label
              key={index}
              className={`block p-4 border-2 rounded-sm cursor-pointer transition-all ${
                selectedAddress === address
                  ? 'border-black bg-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <RadioGroup>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={String(index)} checked={selectedAddress === address} />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{address.fullName}</p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    <p className="text-sm text-gray-600">
                      {address.address}
                      {address.ward && `, ${address.ward}`}
                      {address.district && `, ${address.district}`}
                      {address.city && `, ${address.city}`}
                    </p>
                    {address.isDefault && (
                      <Badge variant="secondary" className="mt-2">
                        Mặc định
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
            <Label>Họ và tên *</Label>
            <Input
              value={newAddress.fullName}
              onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>
          <div>
            <Label>Số điện thoại *</Label>
            <Input
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              placeholder="0901234567"
              required
            />
          </div>
          <div>
            <Label>Địa chỉ *</Label>
            <Input
              value={newAddress.address}
              onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              placeholder="Số nhà, tên đường"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Phường/Xã</Label>
              <Input
                value={newAddress.ward}
                onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
              />
            </div>
            <div>
              <Label>Quận/Huyện</Label>
              <Input
                value={newAddress.district}
                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
              />
            </div>
            <div>
              <Label>Thành phố *</Label>
              <Input
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder="Hà Nội"
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
          {showNewAddress ? 'Chọn địa chỉ có sẵn' : 'Thêm địa chỉ mới'}
        </Button>
      )}

      {/* Action Button */}
      <Button onClick={handleNext} className="w-full" size="lg">
        Tiếp Tục
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
  onBack,
  onNext,
}: any) {
  const [newPayment, setNewPayment] = useState({
    type: 'card' as 'card' | 'bank' | 'momo' | 'cod',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })

  const handleNext = () => {
    if (!selectedPayment && !showNewPayment) {
      alert('Vui lòng chọn phương thức thanh toán')
      return
    }
    if (showNewPayment && newPayment.type === 'card') {
      if (!newPayment.cardNumber || !newPayment.cardName || !newPayment.expiryDate) {
        alert('Vui lòng điền đầy đủ thông tin thẻ')
        return
      }
      onSelectPayment(newPayment)
    } else if (showNewPayment) {
      onSelectPayment(newPayment)
    }
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-gray-50 rounded-sm p-8"
    >
      <h2 className="text-2xl uppercase tracking-wide mb-6">Phương Thức Thanh Toán</h2>

      {/* Saved Payment Methods */}
      {user?.paymentMethods && user.paymentMethods.length > 0 && !showNewPayment && (
        <div className="space-y-4 mb-6">
          {user.paymentMethods.map((method: any, index: number) => (
            <label
              key={index}
              className={`block p-4 border-2 rounded-sm cursor-pointer transition-all ${
                selectedPayment === method
                  ? 'border-black bg-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <RadioGroup>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={String(index)} checked={selectedPayment === method} />
                  <div>
                    <p className="font-semibold">
                      {method.type === 'card' && '💳 Thẻ tín dụng/ghi nợ'}
                      {method.type === 'bank' && '🏦 Chuyển khoản ngân hàng'}
                      {method.type === 'cod' && '💵 Thanh toán khi nhận hàng'}
                      {method.type === 'momo' && '📱 Ví MoMo'}
                    </p>
                    {method.type === 'card' && method.cardNumber && (
                      <p className="text-sm text-gray-600">
                        •••• •••• •••• {method.cardNumber.slice(-4)}
                      </p>
                    )}
                    {method.isDefault && (
                      <Badge variant="secondary" className="mt-1">
                        Mặc định
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
            {['card', 'bank', 'momo', 'cod'].map((type) => (
              <Button
                key={type}
                variant={newPayment.type === type ? 'default' : 'outline'}
                onClick={() => setNewPayment({ ...newPayment, type: type as any })}
                className="p-4 h-auto flex-col"
              >
                <span className="text-lg mb-1">
                  {type === 'card' && '💳'}
                  {type === 'bank' && '🏦'}
                  {type === 'momo' && '📱'}
                  {type === 'cod' && '💵'}
                </span>
                <span className="text-sm">
                  {type === 'card' && 'Thẻ'}
                  {type === 'bank' && 'Chuyển khoản'}
                  {type === 'momo' && 'MoMo'}
                  {type === 'cod' && 'COD'}
                </span>
              </Button>
            ))}
          </div>

          {/* Card Details */}
          {newPayment.type === 'card' && (
            <div className="space-y-4 pt-4">
              <div>
                <Label>Số thẻ *</Label>
                <Input
                  value={newPayment.cardNumber}
                  onChange={(e) => setNewPayment({ ...newPayment, cardNumber: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div>
                <Label>Tên trên thẻ *</Label>
                <Input
                  value={newPayment.cardName}
                  onChange={(e) => setNewPayment({ ...newPayment, cardName: e.target.value })}
                  placeholder="NGUYEN VAN A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngày hết hạn *</Label>
                  <Input
                    value={newPayment.expiryDate}
                    onChange={(e) => setNewPayment({ ...newPayment, expiryDate: e.target.value })}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label>CVV *</Label>
                  <Input
                    value={newPayment.cvv}
                    onChange={(e) => setNewPayment({ ...newPayment, cvv: e.target.value })}
                    placeholder="123"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {newPayment.type === 'bank' && (
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
              <p className="text-sm mb-2">Chuyển khoản đến:</p>
              <p className="text-sm">
                <strong>Ngân hàng:</strong> Vietcombank
              </p>
              <p className="text-sm">
                <strong>Số tài khoản:</strong> 1234567890
              </p>
              <p className="text-sm">
                <strong>Chủ tài khoản:</strong> CONG TY THEWHITE
              </p>
            </div>
          )}

          {newPayment.type === 'momo' && (
            <div className="bg-pink-50 border border-pink-200 rounded-sm p-4">
              <p className="text-sm">
                Bạn sẽ được chuyển đến ứng dụng MoMo để hoàn tất thanh toán.
              </p>
            </div>
          )}

          {newPayment.type === 'cod' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4">
              <p className="text-sm">
                Thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị đúng số tiền.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Toggle New Payment */}
      {user?.paymentMethods && user.paymentMethods.length > 0 && (
        <Button variant="ghost" onClick={onToggleNewPayment} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          {showNewPayment ? 'Chọn phương thức có sẵn' : 'Thêm phương thức mới'}
        </Button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Quay Lại
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Tiếp Tục
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
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Order Items */}
      <div className="bg-gray-50 rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">Sản Phẩm ({cartItems.length})</h3>
        <div className="space-y-4">
          {cartItems.map((item: any, index: number) => (
            <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
              <div className="relative w-20 h-24 bg-gray-200 rounded-sm overflow-hidden shrink-0">
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
                <p className="text-sm text-gray-600">Size: {item.size}</p>
                <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-gray-50 rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">Địa Chỉ Giao Hàng</h3>
        {selectedAddress && (
          <div>
            <p className="font-semibold mb-1">{selectedAddress.fullName}</p>
            <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
            <p className="text-sm text-gray-600">
              {selectedAddress.address}
              {selectedAddress.ward && `, ${selectedAddress.ward}`}
              {selectedAddress.district && `, ${selectedAddress.district}`}
              {selectedAddress.city && `, ${selectedAddress.city}`}
            </p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">Phương Thức Thanh Toán</h3>
        {selectedPayment && (
          <div>
            <p className="font-semibold">
              {selectedPayment.type === 'card' && '💳 Thẻ tín dụng/ghi nợ'}
              {selectedPayment.type === 'bank' && '🏦 Chuyển khoản ngân hàng'}
              {selectedPayment.type === 'cod' && '💵 Thanh toán khi nhận hàng'}
              {selectedPayment.type === 'momo' && '📱 Ví MoMo'}
            </p>
            {selectedPayment.type === 'card' && selectedPayment.cardNumber && (
              <p className="text-sm text-gray-600">
                •••• •••• •••• {selectedPayment.cardNumber.slice(-4)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Order Notes */}
      <div className="bg-gray-50 rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">Ghi Chú Đơn Hàng</h3>
        <Textarea
          value={orderNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Ghi chú về đơn hàng (tùy chọn)"
          rows={4}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Quay Lại
        </Button>
        <Button onClick={onComplete} className="flex-1" size="lg">
          Đặt Hàng
        </Button>
      </div>
    </motion.div>
  )
}

// Confirmation Step Component
function ConfirmationStep({
  orderId,
  total,
  onViewOrders,
  onContinueShopping,
}: {
  orderId: string
  total: number
  onViewOrders: () => void
  onContinueShopping: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center py-12"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="text-3xl uppercase tracking-wide mb-4">Đặt Hàng Thành Công!</h1>
      <p className="text-gray-600 mb-8">
        Cảm ơn bạn đã mua hàng tại TheWhite. Chúng tôi sẽ xử lý đơn hàng của bạn ngay lập tức.
      </p>

      <div className="bg-gray-50 rounded-sm p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
            <p className="text-xl font-bold">{orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
            <p className="text-xl font-bold">{total.toLocaleString('vi-VN')}₫</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <p className="text-sm text-gray-600">
          📧 Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn
        </p>
        <p className="text-sm text-gray-600">
          📦 Bạn có thể theo dõi đơn hàng trong trang Đơn Hàng Của Tôi
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onContinueShopping} className="flex-1" size="lg">
          Tiếp Tục Mua Sắm
        </Button>
        <Button onClick={onViewOrders} className="flex-1" size="lg">
          Xem Đơn Hàng
        </Button>
      </div>
    </motion.div>
  )
}
