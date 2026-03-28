'use client'

import { useState, useMemo } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import {
  CheckoutStep,
  ShippingAddress,
  PaymentMethod,
  AppliedCoupon,
  OrderTotals,
} from '@/types/checkout'

interface UseCheckoutReturn {
  step: CheckoutStep
  setStep: (step: CheckoutStep) => void
  selectedAddress: ShippingAddress | null
  setSelectedAddress: (addr: ShippingAddress | null) => void
  selectedPayment: PaymentMethod | null
  setSelectedPayment: (method: PaymentMethod | null) => void
  orderNotes: string
  setOrderNotes: (notes: string) => void
  totals: OrderTotals
  completeOrder: (appliedCoupon: AppliedCoupon | null) => Promise<void>
  isSubmitting: boolean
  orderError: string | null
  orderResult: any | null
}

const SHIPPING_FEE = 30000

export function useCheckout(): UseCheckoutReturn {
  const { items: cartItems, getTotalPrice, clearCart } = useCart()
  const { user } = useUser()

  const [step, setStep] = useState<CheckoutStep>('shipping')
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [orderNotes, setOrderNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orderResult, setOrderResult] = useState<any | null>(null)

  const totals = useMemo<OrderTotals>(() => {
    // appliedCoupon is passed to completeOrder but totals need it live.
    // We expose a stable totals object that is recalculated on demand via
    // the getTotalsWithCoupon helper below. For the sidebar display we keep
    // it simple — callers can recalculate by passing coupon to getTotals.
    // The hook re-exports a plain totals without coupon; the page can merge.
    const subtotal = getTotalPrice()
    const shipping = SHIPPING_FEE
    const discount = 0
    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
    }
  }, [getTotalPrice])

  const completeOrder = async (appliedCoupon: AppliedCoupon | null) => {
    setIsSubmitting(true)
    setOrderError(null)

    try {
      const subtotal = getTotalPrice()
      const shippingFee = appliedCoupon?.type === 'shipping' ? 0 : SHIPPING_FEE
      const discount = appliedCoupon?.discount ?? 0
      const total = subtotal + shippingFee - discount

      const orderData = {
        customerInfo: {
          name: user?.fullName ?? selectedAddress?.name ?? '',
          email: user?.email ?? '',
          phone: user?.phone ?? selectedAddress?.phone ?? '',
          ...(user?.id ? { user: user.id } : {}),
        },
        shippingAddress: {
          address: selectedAddress?.address ?? '',
          province: selectedAddress?.province?.id ?? null,
          district: selectedAddress?.district?.id ?? null,
          ward: selectedAddress?.ward?.id ?? null,
        },
        items: cartItems.map((item) => ({
          product: item.id,
          productName: item.name,
          variant: item.color ?? null,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.price,
          lineTotal: item.price * item.quantity,
          productImage: item.image,
        })),
        payment: {
          method: selectedPayment?.type ?? 'cod',
          paymentStatus: 'pending',
        },
        totals: {
          subtotal,
          shippingFee,
          discount,
          total,
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        },
        ...(orderNotes ? { notes: orderNotes } : {}),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message ?? `Order submission failed (${res.status})`)
      }

      const result = await res.json()
      setOrderResult(result)
      clearCart()
      setStep('confirmation')
    } catch (err) {
      console.error('Error submitting order:', err)
      setOrderError(
        err instanceof Error ? err.message : 'Đặt hàng thất bại. Vui lòng thử lại.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    step,
    setStep,
    selectedAddress,
    setSelectedAddress,
    selectedPayment,
    setSelectedPayment,
    orderNotes,
    setOrderNotes,
    totals,
    completeOrder,
    isSubmitting,
    orderError,
    orderResult,
  }
}
