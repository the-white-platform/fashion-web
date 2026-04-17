'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/Link'
import { PageContainer } from '@/components/layout/PageContainer'
import { useTranslations } from 'next-intl'

export default function UnsubscribePage() {
  const t = useTranslations('unsubscribe')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    const unsubscribe = async () => {
      setStatus('loading')
      try {
        const res = await fetch('/api/newsletter-subscribers/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }

    unsubscribe()
  }, [token])

  return (
    <PageContainer>
      <div className="flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-muted-foreground" />
              <h1 className="text-2xl uppercase tracking-wide mb-2">{t('processing')}</h1>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl uppercase tracking-wide mb-2">{t('successTitle')}</h1>
              <p className="text-muted-foreground mb-6">{t('successDesc')}</p>
              <Link
                href="/"
                className="inline-block bg-foreground text-background px-6 py-3 rounded-sm uppercase tracking-wide text-sm"
              >
                {t('backHome')}
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h1 className="text-2xl uppercase tracking-wide mb-2">{t('errorTitle')}</h1>
              <p className="text-muted-foreground mb-6">{t('errorDesc')}</p>
              <Link
                href="/"
                className="inline-block bg-foreground text-background px-6 py-3 rounded-sm uppercase tracking-wide text-sm"
              >
                {t('backHome')}
              </Link>
            </>
          )}

          {status === 'idle' && null}
        </motion.div>
      </div>
    </PageContainer>
  )
}
