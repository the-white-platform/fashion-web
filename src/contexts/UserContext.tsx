'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { ShippingAddress, PaymentMethod, AddressLocation } from '@/types/checkout'

interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  // ISO date string (YYYY-MM-DD). Used for birthday discount ZNS.
  dateOfBirth?: string
  // Auto-generated on create (see collections/Users/index.ts
  // beforeChange). Shown to the user on /loyalty so they can
  // share it to earn a referral bonus.
  referralCode?: string
  // Drives the "Management" pill in the header for staff users.
  role?: 'admin' | 'manager' | 'editor' | 'staff' | 'customer'
  avatar?: string
  provider?: 'local' | 'google' | 'facebook'
  shippingAddresses: ShippingAddress[]
  paymentMethods: PaymentMethod[]
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  /**
   * `identifier` accepts either an email address or a Vietnamese
   * phone number (e.g. `0901234567` or `+84 901 234 567`). Server
   * resolves phone inputs to the stored account.
   */
  login: (identifier: string, password: string) => Promise<boolean>
  /**
   * `identifier` accepts either an email address or a Vietnamese
   * phone number. When a phone is provided the server synthesises a
   * placeholder email for Payload auth.
   */
  register: (
    fullName: string,
    identifier: string,
    password: string,
    phone?: string,
  ) => Promise<boolean>
  logout: () => void
  updateProfile: (
    data: Partial<{ name: string; phone: string; email: string; dateOfBirth: string | null }>,
  ) => Promise<void>
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
  dateOfBirth?: string | null
  referralCode?: string | null
  role?: 'admin' | 'manager' | 'editor' | 'staff' | 'customer'
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
    dateOfBirth: payloadUser.dateOfBirth
      ? new Date(payloadUser.dateOfBirth).toISOString().slice(0, 10)
      : undefined,
    referralCode: payloadUser.referralCode ?? undefined,
    role: payloadUser.role,
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
   * Login with identifier (email OR Vietnamese phone) + password.
   * Routes through `/api/auth/login-identity` which resolves phone
   * inputs to the stored account and delegates to Payload's built-in
   * login endpoint.
   * Returns true on success, false on invalid credentials.
   * Throws on unexpected errors.
   */
  async function login(identifier: string, password: string): Promise<boolean> {
    const res = await fetch('/api/auth/login-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const status = res.status
      // 401 = wrong credentials — return false (callers display their own error msg)
      if (status === 401) return false
      throw new Error(err.error ?? 'Invalid credentials')
    }
    const data = await res.json()
    if (data?.user) setUser(mapPayloadUser(data.user))
    // login-identity forwards Payload's Set-Cookie, so the session is
    // already live. Refresh from /api/users/me to ensure the context
    // has the full user shape (including relationships).
    try {
      const meRes = await fetch('/api/users/me', { credentials: 'include' })
      if (meRes.ok) {
        const meData = await meRes.json()
        if (meData?.user) setUser(mapPayloadUser(meData.user))
      }
    } catch {
      /* noop */
    }
    return true
  }

  /**
   * Register with identifier (email OR Vietnamese phone) + password.
   * The `identifier` field accepts either — the backend synthesises
   * a placeholder email for phone-only signups so Payload auth
   * still gets a unique email. Optional `phone` applies when the
   * identifier is an email but the user also wants to record a
   * phone number up-front.
   *
   * Signature kept positional so existing call sites
   * `register(name, email, password, phone?)` still compile; they
   * just stop caring which slot the email lives in.
   * Returns true on success, false if the identifier is already taken.
   * Throws on other errors.
   */
  async function register(
    fullName: string,
    identifier: string,
    password: string,
    phone?: string,
  ): Promise<boolean> {
    const res = await fetch('/api/auth/register-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: fullName, identifier, password, phone }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      // Re-throw with the server's real reason. 409 used to silently
      // collapse to a generic "registration failed" banner; now the
      // caller's catch block surfaces "This phone number is already
      // registered" / "This account is already registered" via
      // `describeError`.
      throw new Error(
        err.error ?? (res.status === 409 ? 'Already registered' : 'Registration failed'),
      )
    }
    const data = await res.json()
    // register-identity sets the payload-token cookie directly, so
    // /api/users/me is now authenticated.
    try {
      const meRes = await fetch('/api/users/me', { credentials: 'include' })
      if (meRes.ok) {
        const meData = await meRes.json()
        if (meData?.user) setUser(mapPayloadUser(meData.user))
      }
    } catch {
      /* noop */
    }
    void data
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
    data: Partial<{ name: string; phone: string; email: string; dateOfBirth: string | null }>,
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
