'use client'

import { useState } from 'react'
import { AppliedCoupon } from '@/types/checkout'

interface UseCouponReturn {
  couponCode: string
  setCouponCode: (code: string) => void
  appliedCoupon: AppliedCoupon | null
  couponError: string
  applyCoupon: (subtotal: number) => Promise<void>
  removeCoupon: () => void
}

export function useCoupon(): UseCouponReturn {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState('')

  const applyCoupon = async (subtotal: number) => {
    if (!couponCode.trim()) {
      setCouponError('errorEmpty')
      return
    }

    setCouponError('')

    try {
      const res = await fetch(
        `/api/coupons?where[code][equals]=${encodeURIComponent(couponCode.trim())}&where[active][equals]=true&limit=1`,
      )

      if (!res.ok) {
        setCouponError('errorNetwork')
        return
      }

      const data = await res.json()
      const coupon = data?.docs?.[0]

      if (!coupon) {
        setCouponError('errorInvalid')
        setAppliedCoupon(null)
        return
      }

      // Validate date range
      const now = new Date()
      if (coupon.validFrom && new Date(coupon.validFrom) > now) {
        setCouponError('errorNotYetValid')
        setAppliedCoupon(null)
        return
      }
      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        setCouponError('errorExpired')
        setAppliedCoupon(null)
        return
      }

      // Validate usage limit. usageLimit === 0 means unlimited (per the
      // Coupons collection's admin hint), so skip the check when it's
      // zero or null.
      if (
        coupon.usageLimit != null &&
        coupon.usageLimit > 0 &&
        coupon.usageCount != null &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        setCouponError('errorUsageLimit')
        setAppliedCoupon(null)
        return
      }

      // Validate minimum order amount
      if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
        setCouponError('errorMinOrder')
        setAppliedCoupon(null)
        return
      }

      // Calculate discount amount
      let discount = 0
      if (coupon.type === 'percentage') {
        discount = subtotal * (coupon.value / 100)
        if (coupon.maxDiscount != null) {
          discount = Math.min(discount, coupon.maxDiscount)
        }
      } else if (coupon.type === 'fixed') {
        discount = coupon.value
      } else if (coupon.type === 'shipping') {
        // Shipping coupon: discount is the shipping fee (handled by useCheckout)
        discount = 0
      }

      setAppliedCoupon({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description ?? '',
        discount,
      })
      setCouponError('')
    } catch (err) {
      console.error('Error applying coupon:', err)
      setCouponError('errorNetwork')
      setAppliedCoupon(null)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
  }
}
