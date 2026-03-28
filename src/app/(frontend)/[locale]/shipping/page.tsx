'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function ShippingRedirectPage() {
  const router = useRouter()
  const t = useTranslations('shipping')

  useEffect(() => {
    router.replace('/payment-shipping')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p>{t('redirecting')}</p>
    </div>
  )
}
