'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

function getStatusInfo(status: string) {
  switch (status) {
    case 'processing':
      return {
        label: 'Đang Xử Lý',
        icon: Clock,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        description: 'Đơn hàng đang được xử lý',
      }
    case 'confirmed':
      return {
        label: 'Đã Xác Nhận',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        description: 'Đơn hàng đã được xác nhận',
      }
    case 'shipping':
      return {
        label: 'Đang Giao',
        icon: Truck,
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        description: 'Đơn hàng đang được giao đến bạn',
      }
    case 'delivered':
      return {
        label: 'Đã Giao',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        description: 'Đơn hàng đã được giao thành công',
      }
    case 'cancelled':
      return {
        label: 'Đã Hủy',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        description: 'Đơn hàng đã bị hủy',
      }
    default:
      return {
        label: 'Không Xác Định',
        icon: Package,
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        description: '',
      }
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useUser()
  const orders = user?.orderHistory || []

  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Đơn Hàng</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl uppercase tracking-wide mb-2 text-foreground">
            Đơn Hàng Của Tôi
          </h1>
          <p className="text-muted-foreground">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders
              .slice()
              .reverse()
              .map((order: any) => {
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
                            Đơn Hàng #{order.id}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Đặt ngày: {new Date(order.date).toLocaleDateString('vi-VN')}
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
                                src={item.image || '/assets/placeholder.jpg'}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium mb-1 truncate text-foreground">
                                {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Size: {item.size} • Số lượng: {item.quantity}
                              </p>
                              <p className="text-sm font-medium mt-1 text-foreground">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            + {order.items.length - 3} sản phẩm khác
                          </p>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <p className="text-sm text-muted-foreground">Tổng tiền</p>
                          <p className="text-xl font-bold text-foreground">
                            {order.total.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-sm hover:border-foreground transition-colors bg-background text-foreground"
                        >
                          Xem Chi Tiết
                          <ChevronRight className="w-4 h-4" />
                        </button>
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
              Chưa Có Đơn Hàng
            </h2>
            <p className="text-muted-foreground mb-8">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
            </p>
            <button
              onClick={() => router.push('/products')}
              className="bg-foreground text-background px-8 py-4 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wide"
            >
              Khám Phá Sản Phẩm
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
