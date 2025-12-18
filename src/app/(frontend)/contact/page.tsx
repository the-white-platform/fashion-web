'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    subject: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'general',
        subject: '',
        message: '',
      })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-white pb-12">
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
                <BreadcrumbPage>Liên Hệ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl uppercase tracking-wide mb-4">Liên Hệ</h1>
          <p className="text-gray-600">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-gray-50 rounded-sm p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">Gửi Tin Nhắn</h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl mb-2">Gửi Thành Công!</h3>
                  <p className="text-gray-600">Chúng tôi sẽ phản hồi trong vòng 24h</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">
                      Họ và tên *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm uppercase tracking-wide mb-2">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-wide mb-2">
                        Số điện thoại
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0901234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">Danh mục *</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Câu hỏi chung</SelectItem>
                        <SelectItem value="order">Đơn hàng</SelectItem>
                        <SelectItem value="product">Sản phẩm</SelectItem>
                        <SelectItem value="return">Đổi trả</SelectItem>
                        <SelectItem value="partnership">Hợp tác</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">Tiêu đề *</label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="Vấn đề cần hỗ trợ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">Nội dung *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      placeholder="Mô tả chi tiết vấn đề của bạn..."
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Đang Gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Gửi Tin Nhắn
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-gray-50 rounded-sm p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">Thông Tin Liên Hệ</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">Hotline</h3>
                    <p className="text-gray-700">1900-xxxx (8:00 - 22:00)</p>
                    <p className="text-sm text-gray-600">Miễn phí cuộc gọi</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">Email</h3>
                    <p className="text-gray-700">support@thewhite.vn</p>
                    <p className="text-sm text-gray-600">Phản hồi trong 24h</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">Địa chỉ</h3>
                    <p className="text-gray-700">
                      123 Đường ABC, Quận 1,
                      <br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">Giờ làm việc</h3>
                    <p className="text-gray-700">Thứ 2 - Chủ Nhật</p>
                    <p className="text-sm text-gray-600">8:00 - 22:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-black text-white rounded-sm p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">Kết Nối Với Chúng Tôi</h2>
              <div className="space-y-4">
                <a
                  href="#"
                  className="flex items-center gap-4 p-4 bg-white/10 rounded-sm hover:bg-white/20 transition-colors"
                >
                  <Facebook className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Facebook</p>
                    <p className="text-sm text-gray-400">@TheWhiteVietnam</p>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-4 p-4 bg-white/10 rounded-sm hover:bg-white/20 transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Instagram</p>
                    <p className="text-sm text-gray-400">@thewhite.vn</p>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-4 p-4 bg-white/10 rounded-sm hover:bg-white/20 transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Zalo Official</p>
                    <p className="text-sm text-gray-400">Chat trực tiếp</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-50 rounded-sm p-8">
              <h3 className="uppercase tracking-wide mb-4">Liên Kết Nhanh</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/faq"
                  className="block text-gray-700 hover:text-black transition-colors"
                >
                  → Câu hỏi thường gặp (FAQ)
                </Link>
                <Link
                  href="/return-policy"
                  className="block text-gray-700 hover:text-black transition-colors"
                >
                  → Chính sách đổi trả
                </Link>
                <Link
                  href="/size-guide"
                  className="block text-gray-700 hover:text-black transition-colors"
                >
                  → Hướng dẫn chọn size
                </Link>
                <Link
                  href="/orders"
                  className="block text-gray-700 hover:text-black transition-colors"
                >
                  → Theo dõi đơn hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
