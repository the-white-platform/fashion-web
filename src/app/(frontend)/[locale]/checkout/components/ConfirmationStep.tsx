'use client'

import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Recommendations } from '@/components/ecommerce/Recommendations'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'

interface ConfirmationStepProps {
  orderId: string
  total: number
  selectedPayment: any
  onViewOrders: () => void
  onContinueShopping: () => void
}

export function ConfirmationStep({
  orderId,
  total,
  selectedPayment,
  onViewOrders,
  onContinueShopping,
}: ConfirmationStepProps) {
  const t = useTranslations('checkout')
  const tNav = useTranslations('nav')
  const isBankTransfer = selectedPayment?.type === 'bank'

  // Bank details from the PaymentMethods global — no fallback. If the
  // admin hasn't configured them the QR + account block won't render.
  const paymentMethods = usePaymentMethods()
  const bank = paymentMethods?.bankTransfer
  const bankName = bank?.bankName || ''
  const bankCode = bankName.toUpperCase().replace(/\s+/g, '')
  const accountNumber = bank?.accountNumber || ''
  const accountName = bank?.accountName || ''
  const hasBankDetails = Boolean(bankName && accountNumber && accountName)
  const qrUrl = hasBankDetails
    ? `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${total}&addInfo=${orderId}&accountName=${encodeURIComponent(accountName)}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center py-12"
    >
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-success" />
      </div>

      <h1 className="text-3xl uppercase tracking-wide mb-4">{t('success')}</h1>
      <p className="text-muted-foreground mb-8">{t('successDesc')}</p>

      {isBankTransfer && hasBankDetails && qrUrl && (
        <div className="bg-card border-2 border-primary/20 rounded-sm p-8 mb-8 shadow-xl">
          <h2 className="text-xl uppercase tracking-widest mb-6 font-bold flex items-center justify-center gap-2">
            <span className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-xs">
              1
            </span>
            {t('qrTitle')}
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-10 justify-center mb-6">
            <div className="bg-white p-6 rounded-lg shadow-inner">
              <Image src={qrUrl} alt={t('scanQR')} width={320} height={320} className="mx-auto" />
            </div>
            <div className="text-left space-y-4 max-w-xs">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t('accountHolder')}
                </p>
                <p className="font-bold uppercase tracking-wide">{accountName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t('accountNumber')}
                </p>
                <p className="font-bold text-lg">{accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t('bank')}
                </p>
                <p className="font-bold">{bankName}</p>
              </div>
              <div className="p-3 bg-muted rounded-sm border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t('content')}
                </p>
                <p className="font-mono font-bold text-primary">{orderId}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">{t('qrNote')}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-sm p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('orderId')}</p>
            <p className="text-xl font-bold">{orderId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('total')}</p>
            <p className="text-xl font-bold">{total.toLocaleString('vi-VN')}₫</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8 text-muted-foreground">
        <p className="text-sm">📧 {t('successEmail')}</p>
        <p className="text-sm">📦 {t('successTrack')}</p>
      </div>

      <div className="flex gap-3 mb-12">
        <Button variant="outline" onClick={onContinueShopping} className="flex-1" size="lg">
          {tNav('products')}
        </Button>
        <Button onClick={onViewOrders} className="flex-1" size="lg">
          {t('viewOrders')}
        </Button>
      </div>

      {/* Post-checkout recommendations */}
      <div className="text-left">
        <Recommendations type="popular" title="Có Thể Bạn Cũng Thích" limit={8} />
      </div>
    </motion.div>
  )
}
