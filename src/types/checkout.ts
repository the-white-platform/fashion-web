export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

export interface AddressLocation {
  id: string
  name: string
}

export interface ShippingAddress {
  id: string
  name: string
  phone: string
  address: string
  province: AddressLocation
  district: AddressLocation
  ward: AddressLocation
  isDefault: boolean
}

/** Normalized payment method types — matches Orders collection enum */
export type PaymentMethodType = 'cod' | 'bank_transfer' | 'momo' | 'vnpay'

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  name: string
  details?: string
  isDefault: boolean
}

export interface AppliedCoupon {
  code: string
  type: 'percentage' | 'fixed' | 'shipping'
  value: number
  description: string
  discount: number
}

export interface OrderTotals {
  subtotal: number
  shipping: number
  discount: number
  total: number
}
