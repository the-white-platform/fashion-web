'use client'

import { Truck, RefreshCw, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/cn'

interface FeaturesBadgesProps {
  variant?: 'grid' | 'compact'
  className?: string
}

export function FeaturesBadges({ variant = 'grid', className }: FeaturesBadgesProps) {
  const t = useTranslations('features')

  const features = [
    { icon: Truck, title: t('freeShipping'), desc: t('freeShippingDesc') },
    { icon: RefreshCw, title: t('easyReturns'), desc: t('easyReturnsDesc') },
    { icon: Shield, title: t('warranty'), desc: t('warrantyDesc') },
  ]

  if (variant === 'compact') {
    return (
      <div className={cn('grid grid-cols-3 gap-3 pt-3 border-t border-border', className)}>
        {features.map(({ icon: Icon, title }) => (
          <div key={title} className="text-center">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto mb-1 text-foreground">
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground">
              {title}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('pt-10 border-t border-border', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, desc }) => (
          <div key={desc} className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-muted flex items-center justify-center mb-1">
              <Icon className="w-6 h-6 text-foreground" />
            </div>
            <p className="font-bold uppercase text-[10px] tracking-widest leading-tight whitespace-pre-line">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
