'use client'

import { Fragment } from 'react'
import { Check, CreditCard, Truck, Package } from 'lucide-react'
import { useTranslations } from 'next-intl'

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

interface CheckoutProgressProps {
  currentStep: CheckoutStep
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const t = useTranslations('checkout')

  const steps: Array<{ id: CheckoutStep; label: string; icon: any }> = [
    { id: 'shipping', label: t('shipping'), icon: Truck },
    { id: 'payment', label: t('payment'), icon: CreditCard },
    { id: 'review', label: t('review'), icon: Package },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="mb-12">
      <div className="flex items-center max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index < currentStepIndex
          const isCurrent = step.id === currentStep

          return (
            // Render icon column and connector line as SIBLINGS of the
            // outer flex (using a Fragment) so each connector lives at
            // the same level as the icons. Wrapping each step + its
            // connector in its own flex-1 box was making the gaps uneven
            // because the last step has no connector — its icon then
            // floats to the centre of a full flex-1 box while the
            // others sit at the 25% mark of theirs.
            <Fragment key={step.id}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-12 h-12 rounded-sm border-2 flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-foreground border-foreground text-background'
                      : isCurrent
                        ? 'border-foreground text-foreground'
                        : 'border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span
                  className={`mt-2 text-sm uppercase tracking-wide ${
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 transition-all ${
                    index < currentStepIndex ? 'bg-foreground' : 'bg-border'
                  }`}
                />
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
