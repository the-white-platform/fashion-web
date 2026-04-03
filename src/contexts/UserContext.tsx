'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { ShippingAddress, PaymentMethod, AddressLocation } from '@/types/checkout'

interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  avatar?: string
  provider?: 'local' | 'google' | 'facebook'
  shippingAddresses: ShippingAddress[]
  paymentMethods: PaymentMethod[]
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<{ name: string; phone: string; email: string }>) => Promise<void>
  addShippingAddress: (address: Omit<ShippingAddress, 'id'>) => Promise<void>
  updateShippingAddress: (id: string, address: Partial<ShippingAddress>) => Promise<void>
  deleteShippingAddress: (id: string) => Promise<void>
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>
  updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => Promise<void>
  deletePaymentMethod: (id: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Payload → frontend mapper
// ---------------------------------------------------------------------------

type PayloadAddress = {
  id?: string
  name?: string
  phone?: string
  address?: string
  city?: string | { id: string; name?: string } | null
  district?: string | { id: string; name?: string } | null
  ward?: string | { id: string; name?: string } | null
  isDefault?: boolean
}

type PayloadPaymentMethod = {
  id?: string
  type?: string
  name?: string
  details?: string
  isDefault?: boolean
}

type PayloadUser = {
  id: string
  email: string
  name?: string
  phone?: string
  imageUrl?: string
  provider?: 'local' | 'google' | 'facebook'
  shippingAddresses?: PayloadAddress[] | null
  paymentMethods?: PayloadPaymentMethod[] | null
}

function toAddressLocation(
  val: string | { id: string; name?: string } | null | undefined,
): AddressLocation {
  if (!val) return { id: '', name: '' }
  if (typeof val === 'string') return { id: val, name: val }
  return { id: val.id, name: val.name ?? '' }
}

function mapPayloadUser(payloadUser: PayloadUser): User {
  return {
    id: payloadUser.id,
    email: payloadUser.email,
    fullName: payloadUser.name ?? '',
    phone: payloadUser.phone,
    avatar: payloadUser.imageUrl,
    provider: payloadUser.provider,
    shippingAddresses: (payloadUser.shippingAddresses ?? []).map((a) => ({
      id: a.id ?? crypto.randomUUID(),
      name: a.name ?? '',
      phone: a.phone ?? '',
      address: a.address ?? '',
      province: toAddressLocation(a.city),
      district: toAddressLocation(a.district),
      ward: toAddressLocation(a.ward),
      isDefault: a.isDefault ?? false,
    })),
    paymentMethods: (payloadUser.paymentMethods ?? []).map((m) => ({
      id: m.id ?? crypto.randomUUID(),
      type: (m.type ?? 'cod') as PaymentMethod['type'],
      name: m.name ?? '',
      details: m.details,
      isDefault: m.isDefault ?? false,
    })),
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth on mount via Payload /api/users/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.user) setUser(mapPayloadUser(data.user))
        }
      } catch {
        // not authenticated — ignore
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  // ------------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------------

  /**
   * Login with Payload REST API.
   * Returns true on success, false on invalid credentials.
   * Throws on unexpected errors.
   */
  async function login(email: string, password: string): Promise<boolean> {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const status = res.status
      // 401 = wrong credentials — return false (callers display their own error msg)
      if (status === 401) return false
      throw new Error(err.errors?.[0]?.message ?? 'Invalid email or password')
    }
    const data = await res.json()
    setUser(mapPayloadUser(data.user))
    return true
  }

  /**
   * Register, then auto-login.
   * Signature matches callers: register(fullName, email, password, phone?)
   * Returns true on success, false if the email is already taken (409).
   * Throws on other errors.
   */
  async function register(
    fullName: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<boolean> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fullName, email, password, phone, provider: 'local' }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const status = res.status
      // 409 = duplicate email — return false (caller shows "email already used")
      if (status === 409) return false
      const msg = err.errors?.[0]?.message ?? ''
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
        return false
      }
      throw new Error(msg || 'Registration failed')
    }
    // Auto-login after successful registration
    await login(email, password)
    return true
  }

  function logout(): void {
    // Fire-and-forget — clear state immediately for instant UX
    fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined)
    setUser(null)
  }

  // ------------------------------------------------------------------
  // Profile mutations
  // ------------------------------------------------------------------

  async function updateProfile(
    data: Partial<{ name: string; phone: string; email: string }>,
  ): Promise<void> {
    if (!user) return
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Update failed')
    const updated = await res.json()
    setUser(mapPayloadUser(updated.doc))
  }

  // ------------------------------------------------------------------
  // Shipping addresses
  // ------------------------------------------------------------------

  async function addShippingAddress(address: Omit<ShippingAddress, 'id'>): Promise<void> {
    if (!user) return

    const payloadAddress = {
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.province.id,
      district: address.district.id,
      ward: address.ward.id,
      isDefault: address.isDefault,
    }

    const existing = user.shippingAddresses.map((a) => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      address: a.address,
      city: a.province.id,
      district: a.district.id,
      ward: a.ward.id,
      isDefault: address.isDefault ? false : a.isDefault,
    }))

    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        shippingAddresses: [...existing, payloadAddress],
      }),
    })
    if (!res.ok) throw new Error('Failed to add address')
    const updated = await res.json()
    setUser(mapPayloadUser(updated.doc))
  }

  async function patchUser(data: Record<string, unknown>): Promise<void> {
    if (!user) return
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Update failed')
    const updated = await res.json()
    setUser(mapPayloadUser(updated.doc))
  }

  function toPayloadAddress(addr: ShippingAddress) {
    return {
      id: addr.id,
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.province.id,
      district: addr.district.id,
      ward: addr.ward.id,
      isDefault: addr.isDefault,
    }
  }

  async function updateShippingAddress(
    id: string,
    updates: Partial<ShippingAddress>,
  ): Promise<void> {
    if (!user) return
    const addresses = user.shippingAddresses.map((addr) => {
      if (addr.id === id) return { ...addr, ...updates }
      if (updates.isDefault) return { ...addr, isDefault: false }
      return addr
    })
    setUser({ ...user, shippingAddresses: addresses })
    await patchUser({ shippingAddresses: addresses.map(toPayloadAddress) })
  }

  async function deleteShippingAddress(id: string): Promise<void> {
    if (!user) return
    const addresses = user.shippingAddresses.filter((a) => a.id !== id)
    setUser({ ...user, shippingAddresses: addresses })
    await patchUser({ shippingAddresses: addresses.map(toPayloadAddress) })
  }

  // ------------------------------------------------------------------
  // Payment methods
  // ------------------------------------------------------------------

  function toPayloadPayment(m: PaymentMethod) {
    return { id: m.id, type: m.type, cardNumber: m.details, isDefault: m.isDefault }
  }

  async function addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<void> {
    if (!user) return
    const newMethod: PaymentMethod = { ...method, id: crypto.randomUUID() }
    const methods = method.isDefault
      ? [newMethod, ...user.paymentMethods.map((m) => ({ ...m, isDefault: false }))]
      : [...user.paymentMethods, newMethod]
    setUser({ ...user, paymentMethods: methods })
    await patchUser({ paymentMethods: methods.map(toPayloadPayment) })
  }

  async function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<void> {
    if (!user) return
    const methods = user.paymentMethods.map((m) => {
      if (m.id === id) return { ...m, ...updates }
      if (updates.isDefault) return { ...m, isDefault: false }
      return m
    })
    setUser({ ...user, paymentMethods: methods })
    await patchUser({ paymentMethods: methods.map(toPayloadPayment) })
  }

  async function deletePaymentMethod(id: string): Promise<void> {
    if (!user) return
    const methods = user.paymentMethods.filter((m) => m.id !== id)
    setUser({ ...user, paymentMethods: methods })
    await patchUser({ paymentMethods: methods.map(toPayloadPayment) })
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        addShippingAddress,
        updateShippingAddress,
        deleteShippingAddress,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
