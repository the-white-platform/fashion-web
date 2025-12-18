'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SizePreferences {
  height: string
  weight: string
  preferredSize: string
  bodyType: string
  fitPreference: string
}

interface VTOPreferences {
  skinTone: string
  hairColor: string
  bodyShape: string
  avatarUrl?: string
}

interface ShippingAddress {
  id: string
  name: string
  phone: string
  address: string
  city: string
  district: string
  ward: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  type: 'credit-card' | 'bank-transfer' | 'momo' | 'vnpay' | 'cod'
  name: string
  details: string
  isDefault: boolean
}

interface User {
  id: string
  email: string
  fullName: string
  phone: string
  dateOfBirth?: string
  gender?: string
  avatar?: string
  sizePreferences?: SizePreferences
  vtoPreferences?: VTOPreferences
  shippingAddresses: ShippingAddress[]
  paymentMethods: PaymentMethod[]
  orderHistory: any[]
  createdAt: string
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, fullName: string, phone: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  addShippingAddress: (address: Omit<ShippingAddress, 'id'>) => void
  updateShippingAddress: (id: string, address: Partial<ShippingAddress>) => void
  deleteShippingAddress: (id: string) => void
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void
  updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => void
  deletePaymentMethod: (id: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  // Always start with null to ensure server and client render the same
  // This prevents hydration mismatches
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage only after mount (client-side)
  // This ensures server and client initial renders match
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('thewhite-user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Error loading user:', e)
    }
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('thewhite-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('thewhite-user')
    }
  }, [user])

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
  ): Promise<boolean> => {
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('thewhite-users') || '{}')
    if (existingUsers[email]) {
      return false // User already exists
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      fullName,
      phone,
      shippingAddresses: [],
      paymentMethods: [],
      orderHistory: [],
      createdAt: new Date().toISOString(),
    }

    // Store password separately (in real app, this would be hashed on backend)
    existingUsers[email] = { password, userId: newUser.id }
    localStorage.setItem('thewhite-users', JSON.stringify(existingUsers))

    setUser(newUser)
    return true
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    const existingUsers = JSON.parse(localStorage.getItem('thewhite-users') || '{}')
    const userAuth = existingUsers[email]

    if (!userAuth || userAuth.password !== password) {
      return false // Invalid credentials
    }

    // Load user data
    const allUsersData = JSON.parse(localStorage.getItem('thewhite-user-data') || '{}')
    const userData = allUsersData[userAuth.userId]

    if (userData) {
      setUser(userData)
    } else {
      // Create basic user data if not exists
      const basicUser: User = {
        id: userAuth.userId,
        email,
        fullName: email.split('@')[0],
        phone: '',
        shippingAddresses: [],
        paymentMethods: [],
        orderHistory: [],
        createdAt: new Date().toISOString(),
      }
      setUser(basicUser)
    }

    return true
  }

  const logout = () => {
    if (user) {
      // Save user data before logging out
      const allUsersData = JSON.parse(localStorage.getItem('thewhite-user-data') || '{}')
      allUsersData[user.id] = user
      localStorage.setItem('thewhite-user-data', JSON.stringify(allUsersData))
    }
    setUser(null)
  }

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
  }

  const addShippingAddress = (address: Omit<ShippingAddress, 'id'>) => {
    if (!user) return
    const newAddress: ShippingAddress = {
      ...address,
      id: Date.now().toString(),
    }

    // If this is the first address or set as default, make it default
    const addresses = address.isDefault
      ? [newAddress, ...user.shippingAddresses.map((a) => ({ ...a, isDefault: false }))]
      : [...user.shippingAddresses, newAddress]

    updateProfile({ shippingAddresses: addresses })
  }

  const updateShippingAddress = (id: string, updates: Partial<ShippingAddress>) => {
    if (!user) return
    const addresses = user.shippingAddresses.map((addr) => {
      if (addr.id === id) {
        return { ...addr, ...updates }
      }
      // If making this default, unset others
      if (updates.isDefault) {
        return { ...addr, isDefault: false }
      }
      return addr
    })
    updateProfile({ shippingAddresses: addresses })
  }

  const deleteShippingAddress = (id: string) => {
    if (!user) return
    const addresses = user.shippingAddresses.filter((addr) => addr.id !== id)
    updateProfile({ shippingAddresses: addresses })
  }

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    if (!user) return
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
    }

    const methods = method.isDefault
      ? [newMethod, ...user.paymentMethods.map((m) => ({ ...m, isDefault: false }))]
      : [...user.paymentMethods, newMethod]

    updateProfile({ paymentMethods: methods })
  }

  const updatePaymentMethod = (id: string, updates: Partial<PaymentMethod>) => {
    if (!user) return
    const methods = user.paymentMethods.map((method) => {
      if (method.id === id) {
        return { ...method, ...updates }
      }
      if (updates.isDefault) {
        return { ...method, isDefault: false }
      }
      return method
    })
    updateProfile({ paymentMethods: methods })
  }

  const deletePaymentMethod = (id: string) => {
    if (!user) return
    const methods = user.paymentMethods.filter((method) => method.id !== id)
    updateProfile({ paymentMethods: methods })
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
