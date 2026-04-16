'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Link } from '@/i18n/Link'
import Image from 'next/image'
import { motion } from 'motion/react'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  MapPin,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useUser } from '@/contexts/UserContext'
import { useCart } from '@/contexts/CartContext'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useTranslations } from 'next-intl'
import { reorderItems } from '@/utilities/reorder'
import { toast } from 'sonner'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'

function useGetStatusInfo() {
  const t = useTranslations()
  return (status: string) => {
    switch (status) {
      case 'processing':
        return {
          label: t('orders.status.processing'),
          icon: Clock,
          color: 'text-primary',
          bg: 'bg-primary/10',
          description: t('orders.statusDesc.processing'),
        }
      case 'confirmed':
        return {
          label: t('orders.status.confirmed'),
          icon: CheckCircle,
          color: 'text-success',
          bg: 'bg-success/10',
          description: t('orders.statusDesc.confirmed'),
        }
      case 'shipping':
        return {
          label: t('orders.status.shipping'),
          icon: Truck,
          color: 'text-warning',
          bg: 'bg-warning/10',
          description: t('orders.statusDesc.shipping'),
        }
      case 'delivered':
        return {
          label: t('orders.status.delivered'),
          icon: CheckCircle,
          color: 'text-success',
          bg: 'bg-success/10',
          description: t('orders.statusDesc.delivered'),
        }
      case 'cancelled':
        return {
          label: t('orders.status.cancelled'),
          icon: XCircle,
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          description: t('orders.statusDesc.cancelled'),
        }
      default:
        return {
          label: t('orders.status.unknown'),
          icon: Package,
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          description: '',
        }
    }
  }
}

function useGetTimeline() {
  const t = useTranslations()
  return (status: string, order: any) => {
    return [
      {
        status: 'processing',
        label: t('orders.timeline.placed'),
        date: order?.createdAt || new Date().toISOString(),
        completed: true,
      },
      {
        status: 'confirmed',
        label: t('orders.timeline.confirmed'),
        date: order?.confirmedDate || '',
        completed: ['confirmed', 'shipping', 'delivered'].includes(status),
      },
      {
        status: 'shipping',
        label: t('orders.timeline.shipping'),
        date: order?.shippingDate || '',
        completed: ['shipping', 'delivered'].includes(status),
      },
      {
        status: 'delivered',
        label: t('orders.timeline.delivered'),
        date: order?.deliveredDate || '',
        completed: status === 'delivered',
      },
    ]
  }
}

/** Resolve a relationship field that may be populated (object) or just an ID string */
function resolveName(field: any): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (typeof field === 'object' && field.name) return field.name
  return ''
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { addToCart, setIsCartOpen } = useCart()
  const t = useTranslations()
  const tCommon = useTranslations('common')
  const getStatusInfo = useGetStatusInfo()
  const getTimeline = useGetTimeline()
  const orderId = params?.id ? String(params.id) : ''
  const paymentMethods = usePaymentMethods()

  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(!!orderId)
  const [isReordering, setIsReordering] = useState(false)

  const handleReorder = async () => {
    if (!order?.items) return
    setIsReordering(true)
    try {
      const { added, skipped } = await reorderItems(order.items, addToCart)
      if (added > 0) {
        setIsCartOpen(true)
        toast.success(
          skipped > 0
            ? `Đã thêm ${added} sản phẩm (${skipped} hết hàng)`
            : `Đã thêm ${added} sản phẩm vào giỏ hàng`,
        )
      } else {
        toast.error('Tất cả sản phẩm đã hết hàng')
      }
    } catch {
      toast.error('Không thể đặt lại đơn hàng')
    } finally {
      setIsReordering(false)
    }
  }

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    fetch(`/api/orders?where[orderNumber][equals]=${orderId}&limit=1`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setOrder(data.docs?.[0] || null)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [orderId])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center py-20">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">{t('orders.loading')}</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!order) {
    return (
      <PageContainer>
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl uppercase tracking-wide mb-3">{t('orders.notFound')}</h2>
            <p className="text-muted-foreground mb-8">{t('orders.notFoundDesc')}</p>
            <button
              onClick={() => router.push('/orders')}
              className="bg-foreground text-background px-6 py-3 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wide"
            >
              {t('orders.backToList')}
            </button>
          </div>
        </div>
      </PageContainer>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon
  const timeline = getTimeline(order.status, order)
  const addr = order.shippingAddress

  return (
    <PageContainer>
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{t('nav.home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/orders">{t('orders.title')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>#{order.orderNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{tCommon('back')}</span>
        </button>

        {/* Order Header */}
        <div className="bg-muted rounded-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl uppercase tracking-wide mb-2">
                {t('orders.orderNumber', { number: order.orderNumber })}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('orders.orderedOn', {
                  date: new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`${statusInfo.bg} ${statusInfo.color} border-0 text-base px-4 py-2`}
              >
                <StatusIcon className="w-5 h-5 mr-2" />
                {statusInfo.label}
              </Badge>
              {order.status === 'delivered' && (
                <button
                  onClick={handleReorder}
                  disabled={isReordering}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-sm hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isReordering ? 'Đang xử lý...' : 'Đặt lại'}
                </button>
              )}
            </div>
          </div>
          <p className="text-foreground">{statusInfo.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="text-xl uppercase tracking-wide mb-6">{t('orders.progress')}</h2>
              <div className="space-y-6">
                {timeline.map((step, index) => {
                  const isCompleted = step.completed
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-foreground text-background'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Clock className="w-6 h-6" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-full min-h-[40px] mt-2 ${
                              isCompleted ? 'bg-foreground' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p
                          className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(step.date).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="text-xl uppercase tracking-wide mb-6">{t('orders.products')}</h2>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    <div className="relative w-24 h-24 bg-muted rounded-sm overflow-hidden shrink-0">
                      <Image
                        src={item.productImage || '/assets/placeholder.jpg'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium mb-1">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('orders.size')}: {item.size}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('orders.quantity')}: {item.quantity}
                      </p>
                      <p className="text-lg font-bold mt-2">
                        {((item.unitPrice || 0) * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                      {order.status === 'delivered' && (
                        <button
                          onClick={async () => {
                            const { added } = await reorderItems([item], addToCart)
                            if (added > 0) {
                              setIsCartOpen(true)
                              toast.success('Đã thêm vào giỏ hàng')
                            } else {
                              toast.error('Sản phẩm đã hết hàng')
                            }
                          }}
                          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          {t('orders.buyAgain')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Address */}
            {addr && (
              <div className="bg-card border border-border rounded-sm p-6">
                <h3 className="text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {t('orders.shippingAddress')}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{order.customerInfo?.fullName}</p>
                  <p className="text-muted-foreground">{order.customerInfo?.phone}</p>
                  <p className="text-muted-foreground">
                    {addr.address}
                    {addr.ward && `, ${resolveName(addr.ward)}`}
                    {addr.district && `, ${resolveName(addr.district)}`}
                    {addr.province && `, ${resolveName(addr.province)}`}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method + bank-transfer QR (so customer can pay later from profile) */}
            {order.payment?.method &&
              (() => {
                const method = order.payment.method
                const isBank = method === 'bank_transfer' || method === 'bank'
                const isPaid = order.payment?.paymentStatus === 'paid'
                const bank = paymentMethods?.bankTransfer
                const bankName = bank?.bankName || ''
                const accountNumber = bank?.accountNumber || ''
                const accountName = bank?.accountName || ''
                const hasBankDetails = Boolean(bankName && accountNumber && accountName)
                const bankCode = bankName.toUpperCase().replace(/\s+/g, '')
                const totalAmount = order.totals?.total || 0
                const memo = order.orderNumber || ''
                const qrUrl =
                  isBank && !isPaid && hasBankDetails && memo
                    ? `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`
                    : null

                return (
                  <div className="bg-card border border-border rounded-sm p-6">
                    <h3 className="text-lg uppercase tracking-wide mb-4">{t('orders.payment')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isBank
                        ? t('checkout.paymentMethods.bank')
                        : method === 'cod'
                          ? t('checkout.paymentMethods.cod')
                          : method}
                    </p>

                    {qrUrl && (
                      // Always stack vertically: this whole card lives
                      // in a lg:col-span-1 sidebar (~1/3 of viewport),
                      // so at no breakpoint is there enough room for
                      // QR + bank-info side by side without squeezing
                      // "HO KINH DOANH THE WHITE ACTIVE" into letter-
                      // per-line. QR on top, centered; info below.
                      <div className="flex flex-col items-center gap-4 pt-4 border-t border-border">
                        <div className="bg-white p-4 rounded-lg shadow-inner shrink-0">
                          <Image
                            src={qrUrl}
                            alt={t('checkout.scanQR')}
                            width={240}
                            height={240}
                            className="object-contain"
                          />
                        </div>
                        <div className="text-left space-y-2 text-sm w-full">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                              {t('checkout.accountHolder')}
                            </p>
                            <p className="font-bold uppercase">{accountName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                              {t('checkout.accountNumber')}
                            </p>
                            <p className="font-bold">{accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                              {t('checkout.bank')}
                            </p>
                            <p className="font-bold">{bankName}</p>
                          </div>
                          <div className="p-2 bg-muted rounded-sm border border-border mt-2">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                              {t('checkout.content')}
                            </p>
                            <p className="font-mono font-bold text-primary">{memo}</p>
                          </div>
                          <p className="text-[10px] italic text-muted-foreground mt-2">
                            {t('checkout.qrNote')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

            {/* Order Summary */}
            <div className="bg-muted rounded-sm p-6">
              <h3 className="text-lg uppercase tracking-wide mb-4">{t('orders.summary')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('orders.subtotal')}</span>
                  <span>
                    {(order.totals?.subtotal ?? order.totals?.total ?? 0).toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('orders.shippingFee')}</span>
                  <span>
                    {order.totals?.shippingFee
                      ? `${order.totals.shippingFee.toLocaleString('vi-VN')}₫`
                      : t('checkout.free')}
                  </span>
                </div>
                {order.totals?.discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>{t('orders.discount')}</span>
                    <span>-{order.totals.discount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="font-bold uppercase">{t('orders.total')}</span>
                  <span className="text-xl font-bold">
                    {(order.totals?.total || 0).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
