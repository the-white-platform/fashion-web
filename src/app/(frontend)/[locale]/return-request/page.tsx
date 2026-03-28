'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/Link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Upload, CheckCircle } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useUser } from '@/contexts/UserContext'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function ReturnRequestPage() {
  const router = useRouter()
  const { user } = useUser()
  const t = useTranslations('returnRequest')
  const tNav = useTranslations('nav')

  const [selectedOrder, setSelectedOrder] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    fetch(
      `/api/orders?where[customerInfo.user][equals]=${user.id}&where[status][equals]=delivered&sort=-createdAt&limit=20`,
      { credentials: 'include' },
    )
      .then((res) => res.json())
      .then((data) => setDeliveredOrders(data.docs || []))
      .catch(() => {})
  }, [user])

  const order = deliveredOrders.find((o) => o.orderNumber === selectedOrder) || null

  const reasons = (
    ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] as const
  ).map((key) => t(`reason.${key}`))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleItemToggle = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    } else {
      setSelectedItems([...selectedItems, itemId])
    }
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  if (submitted) {
    return (
      <PageContainer>
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl uppercase tracking-wide mb-4">{t('success.title')}</h1>
            <p className="text-muted-foreground mb-8">
              {returnType === 'return' ? t('success.descReturn') : t('success.descExchange')}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="px-8 py-4 border-2 border-border rounded-sm hover:border-foreground transition-colors uppercase tracking-wide"
              >
                {t('success.home')}
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-4 bg-foreground text-background rounded-sm hover:opacity-90 transition-colors uppercase tracking-wide"
              >
                {t('success.another')}
              </button>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{tNav('home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumb')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl uppercase tracking-wide mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Select Order */}
          <div className="bg-muted border border-border rounded-sm p-6">
            <h2 className="uppercase tracking-wide mb-4">{t('steps.s1')}</h2>
            {deliveredOrders.length > 0 ? (
              <select
                value={selectedOrder}
                onChange={(e) => {
                  setSelectedOrder(e.target.value)
                  setSelectedItems([])
                }}
                className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground bg-background text-foreground"
              >
                <option value="">{t('order.selectDefault')}</option>
                {deliveredOrders.map((o: any) => (
                  <option key={o.id} value={o.orderNumber}>
                    #{o.orderNumber} —{' '}
                    {new Date(o.createdAt).toLocaleDateString('vi-VN')} —{' '}
                    {(o.totals?.total || 0).toLocaleString('vi-VN')}₫
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-muted-foreground">{t('order.noOrders')}</p>
            )}
          </div>

          {/* Select Items */}
          {order && (
            <div className="bg-muted border border-border rounded-sm p-6">
              <h2 className="uppercase tracking-wide mb-4">{t('steps.s2')}</h2>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <label
                    key={index}
                    className={`flex items-center gap-4 p-4 border-2 rounded-sm cursor-pointer transition-all ${
                      selectedItems.includes(index.toString())
                        ? 'border-foreground bg-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(index.toString())}
                      onChange={() => handleItemToggle(index.toString())}
                      className="w-5 h-5"
                    />
                    <div className="w-16 h-20 bg-muted/50 rounded-sm overflow-hidden relative">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="mb-1">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('items.size')}: {item.size} | {t('items.qty')}: {item.quantity}
                      </p>
                      <p className="text-sm">{(item.unitPrice || 0).toLocaleString('vi-VN')}₫</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Return or Exchange */}
          {selectedItems.length > 0 && (
            <div className="bg-muted border border-border rounded-sm p-6">
              <h2 className="uppercase tracking-wide mb-4">{t('steps.s3')}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <label
                  className={`p-6 border-2 rounded-sm cursor-pointer transition-all text-center ${
                    returnType === 'return'
                      ? 'border-foreground bg-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="returnType"
                    value="return"
                    checked={returnType === 'return'}
                    onChange={(e) => setReturnType(e.target.value as any)}
                    className="mb-3"
                  />
                  <p className="uppercase tracking-wide mb-1">{t('type.return')}</p>
                  <p className="text-sm text-muted-foreground">{t('type.returnDesc')}</p>
                </label>

                <label
                  className={`p-6 border-2 rounded-sm cursor-pointer transition-all text-center ${
                    returnType === 'exchange'
                      ? 'border-foreground bg-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="returnType"
                    value="exchange"
                    checked={returnType === 'exchange'}
                    onChange={(e) => setReturnType(e.target.value as any)}
                    className="mb-3"
                  />
                  <p className="uppercase tracking-wide mb-1">{t('type.exchange')}</p>
                  <p className="text-sm text-muted-foreground">{t('type.exchangeDesc')}</p>
                </label>
              </div>
            </div>
          )}

          {/* Reason */}
          {selectedItems.length > 0 && (
            <div className="bg-muted border border-border rounded-sm p-6">
              <h2 className="uppercase tracking-wide mb-4">{t('steps.s4')}</h2>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground bg-background text-foreground"
              >
                <option value="">{t('reason.selectDefault')}</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <label className="block text-sm uppercase tracking-wide mb-2 mt-4">
                {t('reason.descLabel')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground resize-none bg-background text-foreground"
                placeholder={t('reason.descPlaceholder')}
              />
            </div>
          )}

          {/* Upload Images */}
          {selectedItems.length > 0 && (
            <div className="bg-muted border border-border rounded-sm p-6">
              <h2 className="uppercase tracking-wide mb-4">{t('steps.s5')}</h2>
              <div className="border-2 border-dashed border-border rounded-sm p-8 text-center hover:border-muted-foreground transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">{t('images.dragDrop')}</p>
                <p className="text-xs text-muted-foreground/60">{t('images.format')}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          {selectedItems.length > 0 && (
            <div className="flex gap-3">
              <Link
                href="/profile"
                className="flex-1 text-center border-2 border-border py-4 rounded-sm hover:bg-muted transition-colors uppercase tracking-wide"
              >
                {t('buttons.cancel')}
              </Link>
              <button
                type="submit"
                className="flex-1 bg-foreground text-background py-4 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wide"
              >
                {t('buttons.submit')}
              </button>
            </div>
          )}
        </form>

        {/* Policy Info */}
        <div className="mt-8 bg-muted border border-border rounded-sm p-6">
          <h3 className="uppercase tracking-wide mb-3">{t('policy.title')}</h3>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li>• {t('policy.p1')}</li>
            <li>• {t('policy.p2')}</li>
            <li>• {t('policy.p3')}</li>
            <li>• {t('policy.p4')}</li>
            <li>
              • {t('policy.p5')}{' '}
              <Link href="/return-policy" className="text-foreground underline font-bold">
                {t('policy.policyLink')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </PageContainer>
  )
}
