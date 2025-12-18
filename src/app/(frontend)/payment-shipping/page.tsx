'use client'

import { motion } from 'motion/react'
import {
  CreditCard,
  Truck,
  Shield,
  Clock,
  MapPin,
  Package,
  DollarSign,
  Smartphone,
} from 'lucide-react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function PaymentShippingPage() {
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
                <BreadcrumbPage>Thanh Toán & Vận Chuyển</BreadcrumbPage>
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
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">
            Thanh Toán & Vận Chuyển
          </h1>
          <p className="text-gray-600 text-lg">Linh hoạt, an toàn và nhanh chóng</p>
        </motion.div>

        {/* Payment Section */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-black text-white border-2 border-black rounded-sm p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-8 h-8" />
                <h2 className="text-3xl uppercase tracking-wide">Phương Thức Thanh Toán</h2>
              </div>
              <p className="text-gray-300">
                TheWhite chấp nhận nhiều phương thức thanh toán để bạn lựa chọn thuận tiện nhất
              </p>
            </div>

            {/* Payment Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* COD */}
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">
                    COD - Thanh Toán Khi Nhận Hàng
                  </h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    • <strong>Phí:</strong> Miễn phí
                  </p>
                  <p>
                    • <strong>Thời gian:</strong> Thanh toán khi shipper giao hàng
                  </p>
                  <p>
                    • <strong>Áp dụng:</strong> Toàn quốc
                  </p>
                  <p>
                    • <strong>Ưu điểm:</strong> An toàn, kiểm tra hàng trước khi trả tiền
                  </p>
                  <p>
                    • <strong>Lưu ý:</strong> Chỉ nhận tiền mặt, vui lòng chuẩn bị đủ tiền lẻ
                  </p>
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">Chuyển Khoản Ngân Hàng</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    • <strong>Phí:</strong> Miễn phí
                  </p>
                  <p>
                    • <strong>Ưu đãi:</strong> Giảm 2% tổng đơn hàng
                  </p>
                  <p>
                    • <strong>Thời gian:</strong> Xử lý trong 1-2 giờ sau khi nhận chuyển khoản
                  </p>
                  <p className="mt-4">
                    <strong>Thông tin tài khoản:</strong>
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 text-sm">
                    <p>Ngân hàng: Vietcombank</p>
                    <p>Số TK: 1234 5678 9012</p>
                    <p>Tên: CONG TY THEWHITE</p>
                    <p className="mt-2 text-xs text-gray-600">
                      Nội dung: [Mã đơn hàng] [Số điện thoại]
                    </p>
                  </div>
                </div>
              </div>

              {/* Credit/Debit Card */}
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">Thẻ ATM / Visa / MasterCard</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    • <strong>Phí:</strong> Miễn phí
                  </p>
                  <p>
                    • <strong>Bảo mật:</strong> Mã hóa SSL 256-bit, chuẩn PCI-DSS
                  </p>
                  <p>
                    • <strong>Xác thực:</strong> 3D Secure / OTP
                  </p>
                  <p>
                    • <strong>Ngân hàng hỗ trợ:</strong> Vietcombank, Techcombank, VCB, ACB, MB,
                    Sacombank, và hơn 30 ngân hàng khác
                  </p>
                  <p>
                    • <strong>Thẻ quốc tế:</strong> Visa, MasterCard, JCB, AMEX
                  </p>
                </div>
              </div>

              {/* E-Wallets */}
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">Ví Điện Tử</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    • <strong>Phí:</strong> Miễn phí
                  </p>
                  <p>
                    • <strong>Hỗ trợ:</strong> MoMo, ZaloPay, VNPay, ShopeePay
                  </p>
                  <p>
                    • <strong>Ưu đãi:</strong> Hoàn tiền 5-10% (tùy chương trình từng ví)
                  </p>
                  <p>
                    • <strong>Thanh toán:</strong> Quét mã QR hoặc liên kết tài khoản
                  </p>
                  <p>
                    • <strong>Thời gian:</strong> Tức thì, xử lý đơn hàng ngay
                  </p>
                </div>
              </div>

              {/* Installment */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-sm p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">Trả Góp 0% Lãi Suất</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                  <div className="space-y-3">
                    <p>
                      • <strong>Điều kiện:</strong> Đơn hàng từ 3.000.000đ
                    </p>
                    <p>
                      • <strong>Kỳ hạn:</strong> 3, 6, 9, 12 tháng
                    </p>
                    <p>
                      • <strong>Ngân hàng:</strong> Sacombank, VPBank, Home Credit, FE Credit
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p>
                      • <strong>Lãi suất:</strong> 0% (TheWhite hỗ trợ)
                    </p>
                    <p>
                      • <strong>Duyệt nhanh:</strong> 5-10 phút
                    </p>
                    <p>
                      • <strong>Giấy tờ:</strong> CMND/CCCD + Bằng lái (tùy ngân hàng)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-black text-white border-2 border-black rounded-sm p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-8 h-8" />
                <h2 className="text-3xl uppercase tracking-wide">Vận Chuyển</h2>
              </div>
              <p className="text-gray-300">Giao hàng toàn quốc với đối tác vận chuyển uy tín</p>
            </div>

            {/* Shipping Options */}
            <div className="space-y-6">
              {/* Standard Shipping */}
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl uppercase tracking-wide mb-3">Giao Hàng Tiêu Chuẩn</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            <strong>Thời gian:</strong> 3-5 ngày làm việc
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            <strong>Phí:</strong> 30.000đ
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            <strong>Khu vực:</strong> Toàn quốc
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>
                            <strong>Miễn phí:</strong> Đơn từ 500.000đ
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Shipping */}
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl uppercase tracking-wide mb-3">Giao Hàng Nhanh</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            <strong>Thời gian:</strong> 1-2 ngày làm việc
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            <strong>Phí:</strong> 50.000đ
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            <strong>Khu vực:</strong> 63 tỉnh thành
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>
                            <strong>Miễn phí:</strong> Đơn từ 1.000.000đ
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Express Shipping */}
              <div className="bg-white border-2 border-black rounded-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl uppercase tracking-wide mb-3">Giao Hàng Hỏa Tốc</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            <strong>Thời gian:</strong> Trong ngày (đặt trước 12h)
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            <strong>Phí:</strong> 70.000đ
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            <strong>Khu vực:</strong> Nội thành HN, HCM
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>
                            <strong>Giao trong:</strong> 2-4 giờ
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Pickup */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-sm flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl uppercase tracking-wide mb-3">Nhận Tại Cửa Hàng</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            <strong>Thời gian:</strong> Sẵn sàng sau 2 giờ
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            <strong>Phí:</strong> Miễn phí
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            <strong>Địa điểm:</strong> HN, HCM, Đà Nẵng
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>
                            <strong>Giờ nhận:</strong> 9h-21h hàng ngày
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery Partners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <h3 className="text-2xl uppercase tracking-wide mb-6 text-center">
              Đối Tác Vận Chuyển
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-sm">
                <p className="uppercase tracking-wide text-sm">Giao Hàng Nhanh</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-sm">
                <p className="uppercase tracking-wide text-sm">Giao Hàng Tiết Kiệm</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-sm">
                <p className="uppercase tracking-wide text-sm">J&T Express</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-sm">
                <p className="uppercase tracking-wide text-sm">Viettel Post</p>
              </div>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black text-white border-2 border-black rounded-sm p-8 text-center"
          >
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl uppercase tracking-wide mb-4">Bảo Mật & An Toàn</h3>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              Mọi giao dịch thanh toán đều được mã hóa SSL 256-bit và tuân thủ chuẩn bảo mật quốc tế
              PCI-DSS. TheWhite cam kết bảo vệ thông tin cá nhân và tài chính của bạn tuyệt đối.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="px-4 py-2 bg-white/10 rounded-sm">SSL 256-bit</div>
              <div className="px-4 py-2 bg-white/10 rounded-sm">PCI-DSS Certified</div>
              <div className="px-4 py-2 bg-white/10 rounded-sm">3D Secure</div>
              <div className="px-4 py-2 bg-white/10 rounded-sm">Verified by Visa</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
