'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

interface PaymentStepProps {
  user: any
  selectedPayment: any
  onSelectPayment: (payment: any) => void
  showNewPayment: boolean
  onToggleNewPayment: () => void
  onBack: () => void
  onNext: () => void
}

export function PaymentStep({
  user,
  selectedPayment,
  onSelectPayment,
  showNewPayment,
  onToggleNewPayment,
  onBack,
  onNext,
}: PaymentStepProps) {
  const t = useTranslations('checkout')

  const [newPayment, setNewPayment] = useState({
    type: 'bank' as 'bank' | 'cod',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })

  const handleNext = () => {
    if (!selectedPayment && !showNewPayment) {
      alert(t('selectPayment'))
      return
    }
    if (showNewPayment) {
      onSelectPayment(newPayment)
    }
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-card border border-border rounded-sm p-8"
    >
      <h2 className="text-2xl uppercase tracking-wide mb-6">{t('payment')}</h2>

      {/* Saved Payment Methods */}
      {user?.paymentMethods && user.paymentMethods.length > 0 && !showNewPayment && (
        <div className="space-y-4 mb-6">
          {user.paymentMethods.map((method: any, index: number) => (
            <label
              key={index}
              className={`block p-4 border-2 rounded-sm cursor-pointer transition-all ${
                selectedPayment === method
                  ? 'border-foreground bg-background'
                  : 'border-border hover:border-foreground'
              }`}
            >
              <RadioGroup>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={String(index)} checked={selectedPayment === method} />
                  <div>
                    <p className="font-semibold">
                      {method.type === 'card' && `💳 ${t('paymentMethods.card')}`}
                      {method.type === 'bank' && `🏦 ${t('paymentMethods.bank')}`}
                      {method.type === 'cod' && `💵 ${t('paymentMethods.cod')}`}
                      {method.type === 'momo' && `📱 ${t('paymentMethods.momo')}`}
                    </p>
                    {method.type === 'card' && method.cardNumber && (
                      <p className="text-sm text-muted-foreground">
                        •••• •••• •••• {method.cardNumber.slice(-4)}
                      </p>
                    )}
                    {method.isDefault && (
                      <Badge variant="secondary" className="mt-1">
                        {t('default')}
                      </Badge>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </label>
          ))}
        </div>
      )}

      {/* New Payment Form */}
      {showNewPayment && (
        <div className="space-y-4 mb-6">
          {/* Payment Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {['bank', 'cod'].map((type) => (
              <Button
                key={type}
                variant={newPayment.type === type ? 'default' : 'outline'}
                onClick={() => setNewPayment({ ...newPayment, type: type as any })}
                className="p-4 h-auto flex-col"
              >
                <span className="text-lg mb-1">
                  {type === 'card' && '💳'}
                  {type === 'bank' && '🏦'}
                  {type === 'momo' && '📱'}
                  {type === 'cod' && '💵'}
                </span>
                <span className="text-sm">
                  {type === 'card' && t('paymentMethods.card')}
                  {type === 'bank' && t('paymentMethods.bank')}
                  {type === 'momo' && t('paymentMethods.momo')}
                  {type === 'cod' && t('paymentMethods.cod')}
                </span>
              </Button>
            ))}
          </div>

          {newPayment.type === 'bank' && (
            <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 text-sm text-foreground">
              {t('bankTransferConfirmNote')}
            </div>
          )}

          {newPayment.type === 'cod' && (
            <div className="bg-warning/10 border border-warning/30 rounded-sm p-4">
              <p className="text-sm text-foreground">{t('codNote')}</p>
            </div>
          )}
        </div>
      )}

      {/* Toggle New Payment */}
      {user?.paymentMethods && user.paymentMethods.length > 0 && (
        <Button variant="ghost" onClick={onToggleNewPayment} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          {showNewPayment ? t('useSavedPayment') : t('addNewPayment')}
        </Button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t('back')}
        </Button>
        <Button onClick={handleNext} className="flex-1">
          {t('next')}
        </Button>
      </div>
    </motion.div>
  )
}
