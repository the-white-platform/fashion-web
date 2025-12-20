'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft, MapPin } from 'lucide-react'
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

function getTimeline(status: string, order: any) {
  const baseTimeline = [
    {
      status: 'processing',
      label: 'Đơn hàng đã được đặt',
      date: order?.date || new Date().toISOString(),
      completed: true,
    },
    {
      status: 'confirmed',
      label: 'Đơn hàng đã được xác nhận',
      date: order?.confirmedDate || '',
      completed: ['confirmed', 'shipping', 'delivered'].includes(status),
    },
    {
      status: 'shipping',
      label: 'Đơn hàng đang được giao',
      date: order?.shippingDate || '',
      completed: ['shipping', 'delivered'].includes(status),
    },
    {
      status: 'delivered',
      label: 'Đã giao hàng thành công',
      date: order?.deliveredDate || '',
      completed: status === 'delivered',
    },
  ]

  return baseTimeline
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const orderId = params?.id ? String(params.id) : ''

  const order = user?.orderHistory?.find((o: any) => o.id === orderId)

  if (!order) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl uppercase tracking-wide mb-3">Không Tìm Thấy Đơn Hàng</h2>
            <p className="text-gray-600 mb-8">Đơn hàng bạn tìm kiếm không tồn tại.</p>
            <button
              onClick={() => router.push('/orders')}
              className="bg-black text-white px-6 py-3 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Quay Lại Danh Sách Đơn Hàng
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon
  const timeline = getTimeline(order.status, order)

  return (
    <div className="min-h-screen bg-white pt-32 pb-12">
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
                <BreadcrumbLink asChild>
                  <Link href="/orders">Đơn Hàng</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>#{order.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-gray-600 hover:text-black transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        {/* Order Header */}
        <div className="bg-gray-50 rounded-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl uppercase tracking-wide mb-2">Đơn Hàng #{order.id}</h1>
              <p className="text-sm text-gray-600">
                Đặt ngày:{' '}
                {new Date(order.date).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-base px-4 py-2`}>
              <StatusIcon className="w-5 h-5 mr-2" />
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-gray-700">{statusInfo.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <h2 className="text-xl uppercase tracking-wide mb-6">Tiến Trình Đơn Hàng</h2>
              <div className="space-y-6">
                {timeline.map((step, index) => {
                  const isCompleted = step.completed
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
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
                              isCompleted ? 'bg-black' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p
                          className={`font-medium ${isCompleted ? 'text-black' : 'text-gray-400'}`}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-600 mt-1">
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
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <h2 className="text-xl uppercase tracking-wide mb-6">Sản Phẩm</h2>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="relative w-24 h-24 bg-gray-100 rounded-sm overflow-hidden shrink-0">
                      <Image
                        src={item.image || '/assets/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium mb-1">{item.name}</p>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      <p className="text-lg font-bold mt-2">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Address */}
            {order.shipping && (
              <div className="bg-white border border-gray-200 rounded-sm p-6">
                <h3 className="text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Địa Chỉ Giao Hàng
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{order.shipping.fullName}</p>
                  <p className="text-gray-600">{order.shipping.phone}</p>
                  <p className="text-gray-600">
                    {order.shipping.address}
                    {order.shipping.ward && `, ${order.shipping.ward}`}
                    {order.shipping.district && `, ${order.shipping.district}`}
                    {order.shipping.city && `, ${order.shipping.city}`}
                  </p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-sm p-6">
              <h3 className="text-lg uppercase tracking-wide mb-4">Tổng Kết</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{order.total.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                {order.coupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá ({order.coupon.code})</span>
                    <span>-{order.total.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-300 flex justify-between">
                  <span className="font-bold uppercase">Tổng cộng</span>
                  <span className="text-xl font-bold">{order.total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
