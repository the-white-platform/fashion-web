'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, MessageCircle } from 'lucide-react'
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
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
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
          <p className="text-muted-foreground">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-muted border border-border rounded-sm p-8">
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
                  <p className="text-muted-foreground">Chúng tôi sẽ phản hồi trong vòng 24h</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm uppercase tracking-wide mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-wide mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0901234567"
                        className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">Danh mục *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    >
                      <option value="general">Câu hỏi chung</option>
                      <option value="order">Đơn hàng</option>
                      <option value="product">Sản phẩm</option>
                      <option value="return">Đổi trả</option>
                      <option value="partnership">Hợp tác</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">Tiêu đề *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="Vấn đề cần hỗ trợ"
                      className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">Nội dung *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      placeholder="Mô tả chi tiết vấn đề của bạn..."
                      className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors resize-none bg-background text-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-foreground text-background py-4 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wide flex items-center justify-center gap-2 disabled:bg-muted disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        <span>Đang Gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Gửi Tin Nhắn</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-muted border border-border rounded-sm p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">Thông Tin Liên Hệ</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">Hotline</h3>
                    <p className="text-foreground">1900-xxxx (8:00 - 22:00)</p>
                    <p className="text-sm text-muted-foreground">Miễn phí cuộc gọi</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">Email</h3>
                    <p className="text-foreground">support@thewhite.vn</p>
                    <p className="text-sm text-muted-foreground">Phản hồi trong 24h</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">Địa chỉ</h3>
                    <p className="text-foreground">
                      123 Đường ABC, Quận 1,
                      <br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">Giờ làm việc</h3>
                    <p className="text-foreground">Thứ 2 - Chủ Nhật</p>
                    <p className="text-sm text-muted-foreground">8:00 - 22:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-foreground text-background rounded-sm p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">Kết Nối Với Chúng Tôi</h2>
              <div className="space-y-4">
                <a
                  href="#"
                  className="flex items-center gap-4 p-4 bg-background/10 rounded-sm hover:bg-background/20 transition-colors"
                >
                  <Facebook className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Facebook</p>
                    <p className="text-sm opacity-60">@TheWhiteVietnam</p>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-4 p-4 bg-background/10 rounded-sm hover:bg-background/20 transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Instagram</p>
                    <p className="text-sm opacity-60">@thewhite.vn</p>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-4 p-4 bg-background/10 rounded-sm hover:bg-background/20 transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Zalo Official</p>
                    <p className="text-sm opacity-60">Chat trực tiếp</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-muted border border-border rounded-sm p-8">
              <h3 className="uppercase tracking-wide mb-4">Liên Kết Nhanh</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/faq"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  → Câu hỏi thường gặp (FAQ)
                </Link>
                <Link
                  href="/return-policy"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  → Chính sách đổi trả
                </Link>
                <Link
                  href="/size-guide"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  → Hướng dẫn chọn size
                </Link>
                <Link
                  href="/orders"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
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
