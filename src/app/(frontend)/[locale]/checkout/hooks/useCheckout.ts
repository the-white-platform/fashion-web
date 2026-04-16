'use client'

import { useState, useMemo, useEffect } from 'react'
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
  completeOrder: (
    appliedCoupon: AppliedCoupon | null,
    pointsToRedeem?: number,
    orderNumber?: string,
  ) => Promise<void>
  isSubmitting: boolean
  orderError: string | null
  orderResult: any | null
  pointsAvailable: number
  setPointsToRedeem: (pts: number) => void
  pointsToRedeem: number
}

const SHIPPING_FEE = 30000
const POINTS_TO_VND = 100 // 100 points = 10,000 VND (100 pts per 100 VND → 10,000 VND per 100 pts)
const POINTS_VALUE = 100 // 1 pt = 100 VND

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
  const [pointsAvailable, setPointsAvailable] = useState(0)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)

  // Fetch user's available points
  useEffect(() => {
    if (!user) return
    fetch(`/api/loyalty-accounts?where[user][equals]=${user.id}&limit=1`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        const pts = data.docs?.[0]?.points ?? 0
        setPointsAvailable(pts)
      })
      .catch(() => {})
  }, [user])

  const totals = useMemo<OrderTotals>(() => {
    const subtotal = getTotalPrice()
    const shipping = SHIPPING_FEE
    const discount = 0
    // 100 points = 10,000 VND → 1 point = 100 VND
    const pointsDiscount = pointsToRedeem * POINTS_VALUE
    return {
      subtotal,
      shipping,
      discount,
      pointsDiscount,
      pointsRedeemed: pointsToRedeem,
      total: Math.max(0, subtotal + shipping - discount - pointsDiscount),
    }
  }, [getTotalPrice, pointsToRedeem])

  const completeOrder = async (
    appliedCoupon: AppliedCoupon | null,
    overridePoints?: number,
    orderNumber?: string,
  ) => {
    setIsSubmitting(true)
    setOrderError(null)

    const redeemPoints = overridePoints ?? pointsToRedeem

    try {
      const subtotal = getTotalPrice()
      const shippingFee = appliedCoupon?.type === 'shipping' ? 0 : SHIPPING_FEE
      const discount = appliedCoupon?.discount ?? 0
      const pointsDiscount = redeemPoints * POINTS_VALUE
      const total = Math.max(0, subtotal + shippingFee - discount - pointsDiscount)

      // Map UI payment-type keys to the Orders collection enum values.
      // PaymentStep's new-payment form uses `type: 'bank'` and leaks it through
      // `selectedPayment: any`, so we coerce to string and remap to the schema.
      const uiPaymentType = (selectedPayment?.type as string | undefined) ?? 'cod'
      const paymentMethod = uiPaymentType === 'bank' ? 'bank_transfer' : uiPaymentType

      const orderData = {
        // Pre-generated on the page so the VietQR memo on PaymentStep
        // and the confirmation screen reference the same identifier.
        // Server hook only auto-generates when this is missing.
        ...(orderNumber ? { orderNumber } : {}),
        customerInfo: {
          customerName: user?.fullName ?? selectedAddress?.name ?? '',
          customerEmail: user?.email ?? '',
          customerPhone: user?.phone ?? selectedAddress?.phone ?? '',
          ...(user?.id ? { user: user.id } : {}),
        },
        shippingAddress: {
          address: selectedAddress?.address ?? '',
          city: selectedAddress?.province?.id ?? null,
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
          method: paymentMethod,
          paymentStatus: 'pending',
        },
        totals: {
          subtotal,
          shippingFee,
          discount,
          total,
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
          ...(redeemPoints > 0 ? { pointsRedeemed: redeemPoints, pointsDiscount } : {}),
        },
        ...(orderNotes ? { notes: orderNotes } : {}),
      }

      // Deduct loyalty points if redeeming
      if (redeemPoints > 0 && user?.id) {
        // This will be handled server-side after order creation via the loyalty hook.
        // We pass the data so the hook can process the redemption deduction.
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
      setOrderError(err instanceof Error ? err.message : 'Đặt hàng thất bại. Vui lòng thử lại.')
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
    pointsAvailable,
    pointsToRedeem,
    setPointsToRedeem,
  }
}
