'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ShippingRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/payment-shipping')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p>Đang chuyển hướng...</p>
    </div>
  )
}
