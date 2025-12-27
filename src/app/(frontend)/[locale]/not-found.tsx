import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import React from 'react'

export default function NotFound() {
  const t = useTranslations('common.notFound')

  return (
    <div className="container py-32 flex flex-col items-center justify-center min-h-[60vh] text-center bg-background text-foreground">
      <div className="prose max-w-none">
        <h1 className="text-8xl font-bold mb-4 tracking-tighter" style={{ marginBottom: 0 }}>
          {t('title')}
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">{t('description')}</p>
      </div>
      <Link
        href="/"
        className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-sm hover:bg-primary/90 transition-all uppercase tracking-wider font-bold shadow-lg hover:scale-105"
      >
        {t('home')}
      </Link>
    </div>
  )
}
