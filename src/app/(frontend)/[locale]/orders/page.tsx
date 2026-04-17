'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/Link'
import Image from 'next/image'
import { motion } from 'motion/react'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  ShoppingBag,
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

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useUser()
  const { addToCart, setIsCartOpen } = useCart()
  const t = useTranslations()
  const getStatusInfo = useGetStatusInfo()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(!!user)
  const [reordering, setReordering] = useState<string | null>(null)

  const handleBuyAgain = async (order: any) => {
    setReordering(order.id)
    try {
      const { added, skipped } = await reorderItems(order.items ?? [], addToCart)
      if (added > 0) {
        setIsCartOpen(true)
        toast.success(
          skipped > 0
            ? t('orders.addedWithSkipped', { added, skipped })
            : t('orders.addedToCart', { added }),
        )
      } else {
        toast.error(t('orders.allOutOfStock'))
      }
    } catch {
      toast.error(t('orders.cannotAdd'))
    } finally {
      setReordering(null)
    }
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetch(`/api/orders?where[customerInfo.user][equals]=${user.id}&sort=-createdAt&limit=50`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setOrders(data.docs || [])
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

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
                <BreadcrumbPage>{t('orders.title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl uppercase tracking-wide mb-2 text-foreground">
            {t('orders.title')}
          </h1>
          <p className="text-muted-foreground">{t('orders.subtitle')}</p>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-sm overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold mb-1 text-foreground">
                          {t('orders.orderNumber', { number: order.orderNumber })}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {t('orders.orderedOn', {
                            date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${statusInfo.bg} ${statusInfo.color} border-0 dark:bg-opacity-20`}
                        >
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {order.items?.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex gap-4">
                          <div className="relative w-20 h-20 bg-muted rounded-sm overflow-hidden shrink-0">
                            <Image
                              src={item.productImage || '/assets/placeholder.jpg'}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium mb-1 truncate text-foreground">
                              {item.productName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t('orders.sizeAndQty', { size: item.size, qty: item.quantity })}
                            </p>
                            <p className="text-sm font-medium mt-1 text-foreground">
                              {((item.unitPrice || 0) * item.quantity).toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          {t('orders.moreItems', { count: order.items.length - 3 })}
                        </p>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('orders.total')}</p>
                        <p className="text-xl font-bold text-foreground">
                          {(order.totals?.total || 0).toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleBuyAgain(order)}
                            disabled={reordering === order.id}
                            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-sm hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            {reordering === order.id
                              ? t('orders.processing')
                              : t('orders.buyAgain')}
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/orders/${order.orderNumber}`)}
                          className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-sm hover:border-foreground transition-colors bg-background text-foreground"
                        >
                          {t('orders.viewDetails')}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl uppercase tracking-wide mb-3 text-foreground">
              {t('orders.empty')}
            </h2>
            <p className="text-muted-foreground mb-8">{t('orders.emptyDesc')}</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-foreground text-background px-8 py-4 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wide"
            >
              {t('orders.exploreProducts')}
            </button>
          </motion.div>
        )}
      </div>
    </PageContainer>
  )
}
