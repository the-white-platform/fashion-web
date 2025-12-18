'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ChevronLeft, Upload, CheckCircle } from 'lucide-react'
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
  const [selectedOrder, setSelectedOrder] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const order = user?.orderHistory?.find((o: any) => o.id === selectedOrder)

  const reasons = [
    'Sản phẩm không đúng size',
    'Sản phẩm bị lỗi/hỏng',
    'Sản phẩm không đúng mô tả',
    'Nhầm sản phẩm',
    'Đổi ý',
    'Khác',
  ]

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
      <div className="min-h-screen bg-white pb-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl uppercase tracking-wide mb-4">Yêu Cầu Đã Được Gửi!</h1>
            <p className="text-gray-600 mb-8">
              Chúng tôi sẽ xử lý yêu cầu {returnType === 'return' ? 'trả hàng' : 'đổi hàng'} của bạn
              trong vòng 24-48h.
              <br />
              Bạn sẽ nhận được email xác nhận sớm nhất.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="px-8 py-4 border-2 border-gray-300 rounded-sm hover:border-black transition-colors uppercase tracking-wide"
              >
                Về Trang Chủ
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-4 bg-black text-white rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-wide"
              >
                Gửi Yêu Cầu Khác
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
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
                <BreadcrumbPage>Yêu Cầu Đổi/Trả Hàng</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl uppercase tracking-wide mb-2">Yêu Cầu Đổi/Trả Hàng</h1>
          <p className="text-gray-600">Vui lòng điền đầy đủ thông tin bên dưới</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Select Order */}
          <div className="bg-gray-50 rounded-sm p-6">
            <h2 className="uppercase tracking-wide mb-4">1. Chọn Đơn Hàng</h2>
            {user?.orderHistory && user.orderHistory.length > 0 ? (
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black"
              >
                <option value="">-- Chọn đơn hàng --</option>
                {user.orderHistory
                  .filter((o: any) => o.status === 'delivered')
                  .map((o: any) => (
                    <option key={o.id} value={o.id}>
                      #{o.id} - {new Date(o.date).toLocaleDateString('vi-VN')} -{' '}
                      {o.total.toLocaleString('vi-VN')}₫
                    </option>
                  ))}
              </select>
            ) : (
              <p className="text-gray-600">Bạn chưa có đơn hàng nào đã giao</p>
            )}
          </div>

          {/* Select Items */}
          {order && (
            <div className="bg-gray-50 rounded-sm p-6">
              <h2 className="uppercase tracking-wide mb-4">2. Chọn Sản Phẩm</h2>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <label
                    key={index}
                    className={`flex items-center gap-4 p-4 border-2 rounded-sm cursor-pointer transition-all ${
                      selectedItems.includes(index.toString())
                        ? 'border-black bg-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(index.toString())}
                      onChange={() => handleItemToggle(index.toString())}
                      className="w-5 h-5"
                    />
                    <div className="w-16 h-20 bg-gray-200 rounded-sm overflow-hidden">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="mb-1">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | Số lượng: {item.quantity}
                      </p>
                      <p className="text-sm">{item.price.toLocaleString('vi-VN')}₫</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Return or Exchange */}
          {selectedItems.length > 0 && (
            <div className="bg-gray-50 rounded-sm p-6">
              <h2 className="uppercase tracking-wide mb-4">3. Loại Yêu Cầu</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <label
                  className={`p-6 border-2 rounded-sm cursor-pointer transition-all text-center ${
                    returnType === 'return'
                      ? 'border-black bg-white'
                      : 'border-gray-200 hover:border-gray-300'
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
                  <p className="uppercase tracking-wide mb-1">Trả Hàng & Hoàn Tiền</p>
                  <p className="text-sm text-gray-600">Sản phẩm sẽ được hoàn tiền 100%</p>
                </label>

                <label
                  className={`p-6 border-2 rounded-sm cursor-pointer transition-all text-center ${
                    returnType === 'exchange'
                      ? 'border-black bg-white'
                      : 'border-gray-200 hover:border-gray-300'
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
                  <p className="uppercase tracking-wide mb-1">Đổi Sản Phẩm</p>
                  <p className="text-sm text-gray-600">Đổi size hoặc màu khác</p>
                </label>
              </div>
            </div>
          )}

          {/* Reason */}
          {selectedItems.length > 0 && (
            <div className="bg-gray-50 rounded-sm p-6">
              <h2 className="uppercase tracking-wide mb-4">4. Lý Do</h2>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black mb-4"
              >
                <option value="">-- Chọn lý do --</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <label className="block text-sm uppercase tracking-wide mb-2">Mô Tả Chi Tiết</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black resize-none"
                placeholder="Mô tả chi tiết vấn đề với sản phẩm..."
              />
            </div>
          )}

          {/* Upload Images */}
          {selectedItems.length > 0 && (
            <div className="bg-gray-50 rounded-sm p-6">
              <h2 className="uppercase tracking-wide mb-4">5. Hình Ảnh (Tùy Chọn)</h2>
              <p className="text-sm text-gray-600 mb-4">Đính kèm hình ảnh sản phẩm nếu có lỗi</p>
              <div className="border-2 border-dashed border-gray-300 rounded-sm p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">Kéo thả hoặc click để tải ảnh lên</p>
                <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB</p>
              </div>
            </div>
          )}

          {/* Submit */}
          {selectedItems.length > 0 && (
            <div className="flex gap-3">
              <Link
                href="/profile"
                className="flex-1 text-center border-2 border-gray-300 py-4 rounded-sm hover:bg-gray-50 transition-colors uppercase tracking-wide"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="flex-1 bg-black text-white py-4 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-wide"
              >
                Gửi Yêu Cầu
              </button>
            </div>
          )}
        </form>

        {/* Policy Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-sm p-6">
          <h3 className="uppercase tracking-wide mb-3">📋 Chính Sách Đổi/Trả</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Đổi/trả trong vòng 30 ngày kể từ ngày nhận hàng</li>
            <li>• Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng</li>
            <li>• Miễn phí đổi size lần đầu và trả hàng nếu sản phẩm lỗi</li>
            <li>• Hoàn tiền trong vòng 5-7 ngày sau khi nhận hàng trả</li>
            <li>
              • Xem chi tiết tại{' '}
              <Link href="/return-policy" className="text-black underline">
                Chính Sách Đổi Trả
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
