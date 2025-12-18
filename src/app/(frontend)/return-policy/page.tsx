'use client'

import { motion } from 'motion/react'
import { Package, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-black pb-12 relative overflow-hidden">
      {/* Noisy Background Texture */}
      <div className="fixed inset-0 opacity-20 pointer-events-none mix-blend-multiply z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
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
                <BreadcrumbPage>Chính Sách Đổi Trả</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">Chính Sách Đổi Trả</h1>
          <p className="text-gray-600 text-lg">Cam kết hài lòng 100% với TheWhite</p>
        </motion.div>

        {/* Key Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-gray-50 border-2 border-gray-200 rounded-sm p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg uppercase tracking-wide mb-2">30 Ngày Đổi Trả</h3>
            <p className="text-sm text-gray-600">Hoàn tiền hoặc đổi size miễn phí</p>
          </div>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-sm p-6 text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg uppercase tracking-wide mb-2">Miễn Phí Vận Chuyển</h3>
            <p className="text-sm text-gray-600">Gửi trả hàng không mất phí</p>
          </div>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-sm p-6 text-center">
            <Package className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg uppercase tracking-wide mb-2">Quy Trình Đơn Giản</h3>
            <p className="text-sm text-gray-600">Chỉ 3 bước là hoàn tất</p>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl uppercase tracking-wide">Điều Kiện Đổi Trả</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Sản phẩm chưa qua sử dụng, giặt, còn nguyên tem mác</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Trong vòng 30 ngày kể từ ngày nhận hàng</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Có hóa đơn hoặc email xác nhận đơn hàng</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Đóng gói đầy đủ, đúng bao bì ban đầu</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Không có vết bẩn, mùi hôi, hoặc hư hỏng do người dùng</span>
              </p>
            </div>
          </motion.div>

          {/* Section 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6" />
              <h2 className="text-2xl uppercase tracking-wide">Quy Trình Đổi Trả</h2>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="uppercase tracking-wide mb-2">Liên Hệ Với Chúng Tôi</h3>
                  <p className="text-gray-600">
                    Gửi email tới support@thewhite.vn hoặc gọi hotline 1900-xxxx để thông báo đổi
                    trả. Cung cấp mã đơn hàng và lý do đổi trả.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="uppercase tracking-wide mb-2">Gửi Sản Phẩm Về</h3>
                  <p className="text-gray-600">
                    Đóng gói sản phẩm cẩn thận. Chúng tôi sẽ gửi email hướng dẫn chi tiết và nhãn
                    vận chuyển miễn phí.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="uppercase tracking-wide mb-2">Nhận Hoàn Tiền Hoặc Sản Phẩm Mới</h3>
                  <p className="text-gray-600">
                    Sau khi kiểm tra (2-3 ngày làm việc), bạn sẽ nhận hoàn tiền (7-10 ngày) hoặc sản
                    phẩm đổi mới (3-5 ngày).
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl uppercase tracking-wide">Trường Hợp Không Áp Dụng</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Sản phẩm đã qua sử dụng, giặt, hoặc mất tem mác</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Quá 30 ngày kể từ ngày nhận hàng</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Sản phẩm giảm giá từ 50% trở lên (chỉ đổi, không hoàn tiền)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Đồ lót, vớ, và các sản phẩm vệ sinh cá nhân</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-black mt-1">•</span>
                <span>Sản phẩm bị hư hỏng do người dùng gây ra</span>
              </p>
            </div>
          </motion.div>

          {/* Section 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black text-white border-2 border-black rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-2xl uppercase tracking-wide">Lưu Ý Quan Trọng</h2>
            </div>
            <div className="space-y-3">
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Hoàn tiền sẽ được chuyển về phương thức thanh toán ban đầu</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Đổi size miễn phí trong vòng 30 ngày (áp dụng 1 lần/đơn hàng)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Khách hàng vui lòng giữ lại email xác nhận đổi trả</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Liên hệ ngay nếu nhận sản phẩm bị lỗi hoặc sai hàng</span>
              </p>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 border-2 border-gray-200 rounded-sm p-8 text-center"
          >
            <h2 className="text-2xl uppercase tracking-wide mb-4">Cần Hỗ Trợ?</h2>
            <p className="text-gray-600 mb-6">
              Đội ngũ chăm sóc khách hàng TheWhite luôn sẵn sàng hỗ trợ bạn
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="mailto:support@thewhite.vn"
                className="bg-black text-white px-6 py-3 rounded-sm hover:bg-gray-800 transition-all uppercase tracking-wide"
              >
                Email: support@thewhite.vn
              </a>
              <a
                href="tel:1900xxxx"
                className="border-2 border-black px-6 py-3 rounded-sm hover:bg-black hover:text-white transition-all uppercase tracking-wide"
              >
                Hotline: 1900-xxxx
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
