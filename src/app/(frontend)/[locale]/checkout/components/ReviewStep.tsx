'use client'

import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Award } from 'lucide-react'

interface ReviewStepProps {
  cartItems: any[]
  selectedAddress: any
  selectedPayment: any
  orderNotes: string
  onNotesChange: (notes: string) => void
  subtotal: number
  shipping: number
  discount: number
  total: number
  appliedCoupon: any
  onBack: () => void
  onComplete: () => void
  pointsAvailable?: number
  pointsToRedeem?: number
  onPointsChange?: (pts: number) => void
  pointsDiscount?: number
}

export function ReviewStep({
  cartItems,
  selectedAddress,
  selectedPayment,
  orderNotes,
  onNotesChange,
  subtotal,
  shipping,
  discount,
  total,
  appliedCoupon,
  onBack,
  onComplete,
  pointsAvailable = 0,
  pointsToRedeem = 0,
  onPointsChange,
  pointsDiscount = 0,
}: ReviewStepProps) {
  const t = useTranslations('checkout')
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Order Items */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">
          {t('items')} ({cartItems.length})
        </h3>
        <div className="space-y-4">
          {cartItems.map((item: any, index: number) => (
            <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0">
              <div className="relative w-20 h-24 bg-muted rounded-sm overflow-hidden shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <p className="mb-1">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t('size')}: {item.size}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('quantity')}: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">{t('shipping')}</h3>
        {selectedAddress && (
          <div>
            <p className="font-semibold mb-1">{selectedAddress.name}</p>
            <p className="text-sm text-muted-foreground">{selectedAddress.phone}</p>
            <p className="text-sm text-muted-foreground">
              {selectedAddress.address}
              {selectedAddress.ward && `, ${selectedAddress.ward}`}
              {selectedAddress.district && `, ${selectedAddress.district}`}
              {selectedAddress.city && `, ${selectedAddress.city}`}
            </p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">{t('payment')}</h3>
        {selectedPayment && (
          <div>
            <p className="font-semibold">
              {selectedPayment.type === 'card' && `💳 ${t('paymentMethods.card')}`}
              {selectedPayment.type === 'bank' && `🏦 ${t('paymentMethods.bank')}`}
              {selectedPayment.type === 'cod' && `💵 ${t('paymentMethods.cod')}`}
              {selectedPayment.type === 'momo' && `📱 ${t('paymentMethods.momo')}`}
            </p>
            {selectedPayment.type === 'card' && selectedPayment.cardNumber && (
              <p className="text-sm text-muted-foreground">
                •••• •••• •••• {selectedPayment.cardNumber.slice(-4)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Loyalty Points Redemption */}
      {pointsAvailable > 0 && onPointsChange && (
        <div className="bg-card border border-border rounded-sm p-6">
          <h3 className="text-xl uppercase tracking-wide mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Điểm Thưởng
          </h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Điểm khả dụng: <strong>{pointsAvailable.toLocaleString('vi-VN')}</strong>
            </span>
            <span className="text-xs text-muted-foreground">100 điểm = 10,000₫</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={pointsAvailable}
              step={100}
              value={pointsToRedeem}
              onChange={(e) => onPointsChange(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <div className="text-right w-32">
              <p className="font-semibold">{pointsToRedeem.toLocaleString('vi-VN')} điểm</p>
              <p className="text-sm text-success">-{pointsDiscount.toLocaleString('vi-VN')}₫</p>
            </div>
          </div>
          {pointsToRedeem > 0 && (
            <button
              type="button"
              onClick={() => onPointsChange(0)}
              className="text-xs text-muted-foreground hover:text-foreground mt-2 uppercase tracking-wide"
            >
              Bỏ dùng điểm
            </button>
          )}
        </div>
      )}

      {/* Order Notes */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="text-xl uppercase tracking-wide mb-4">{t('orderNotes')}</h3>
        <Textarea
          value={orderNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t('orderNotesPlaceholder')}
          rows={4}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t('back')}
        </Button>
        <Button onClick={onComplete} className="flex-1" size="lg">
          {t('placeOrder')}
        </Button>
      </div>
    </motion.div>
  )
}
