'use client'

import { motion } from 'motion/react'
import { ShoppingCart, Package, UserCheck, Truck, CreditCard, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function ShoppingGuidePage() {
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
                <BreadcrumbPage>Hướng Dẫn Mua Hàng</BreadcrumbPage>
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
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">Hướng Dẫn Mua Hàng</h1>
          <p className="text-gray-600 text-lg">Mua sắm dễ dàng tại TheWhite</p>
        </motion.div>

        {/* Shopping Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center text-2xl">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingCart className="w-6 h-6" />
                  <h2 className="text-2xl uppercase tracking-wide">Chọn Sản Phẩm</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>• Duyệt qua các danh mục sản phẩm hoặc sử dụng thanh tìm kiếm</p>
                  <p>• Xem chi tiết sản phẩm: hình ảnh, mô tả, giá cả, size có sẵn</p>
                  <p>
                    • Sử dụng tính năng <strong>Chọn Size Thông Minh AI</strong> để tìm size phù hợp
                  </p>
                  <p>
                    • Thử nghiệm với tính năng <strong>Virtual Try-On</strong> để xem sản phẩm trên
                    bạn
                  </p>
                  <p>• Chọn size, màu sắc và số lượng mong muốn</p>
                  <p>
                    • Nhấn nút <strong>&quot;THÊM VÀO GIỎ&quot;</strong> hoặc{' '}
                    <strong>&quot;MUA NGAY&quot;</strong>
                  </p>
                </div>
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                  <p className="text-sm">
                    <strong>Mẹo:</strong> Lưu sản phẩm yêu thích bằng biểu tượng ❤️ để mua sau!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center text-2xl">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6" />
                  <h2 className="text-2xl uppercase tracking-wide">Kiểm Tra Giỏ Hàng</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>• Nhấn vào biểu tượng giỏ hàng ở góc trên cùng</p>
                  <p>• Xem lại các sản phẩm đã chọn: tên, size, màu, số lượng, giá</p>
                  <p>• Cập nhật số lượng hoặc xóa sản phẩm nếu cần</p>
                  <p>• Nhập mã giảm giá (nếu có) vào ô &quot;MÃ GIẢM GIÁ&quot;</p>
                  <p>• Kiểm tra tổng tiền tạm tính</p>
                  <p>
                    • Nhấn <strong>&quot;THANH TOÁN&quot;</strong> khi đã sẵn sàng
                  </p>
                </div>
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                  <p className="text-sm">
                    <strong>Lưu ý:</strong> Giỏ hàng được lưu trong 7 ngày
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center text-2xl">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-6 h-6" />
                  <h2 className="text-2xl uppercase tracking-wide">Điền Thông Tin</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Thông tin người nhận:</strong>
                  </p>
                  <p>• Họ và tên (bắt buộc)</p>
                  <p>• Số điện thoại liên hệ (bắt buộc)</p>
                  <p>• Email để nhận thông tin đơn hàng (bắt buộc)</p>
                  <p className="mt-4">
                    <strong>Địa chỉ giao hàng:</strong>
                  </p>
                  <p>• Địa chỉ chi tiết (số nhà, tên đường)</p>
                  <p>• Phường/Xã, Quận/Huyện, Tỉnh/Thành phố</p>
                  <p>• Ghi chú thêm cho người giao hàng (tùy chọn)</p>
                </div>
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                  <p className="text-sm">
                    <strong>Bảo mật:</strong> Thông tin cá nhân của bạn được mã hóa và bảo mật tuyệt
                    đối
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center text-2xl">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-6 h-6" />
                  <h2 className="text-2xl uppercase tracking-wide">Chọn Vận Chuyển</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Các phương thức vận chuyển:</strong>
                  </p>
                  <p>
                    • <strong>Giao hàng tiêu chuẩn</strong> - 3-5 ngày (Miễn phí cho đơn từ 500K)
                  </p>
                  <p>
                    • <strong>Giao hàng nhanh</strong> - 1-2 ngày (Phí 30K)
                  </p>
                  <p>
                    • <strong>Giao hàng hỏa tốc</strong> - Trong ngày (Phí 50K, chỉ nội thành HN,
                    HCM)
                  </p>
                  <p>
                    • <strong>Nhận tại cửa hàng</strong> - Miễn phí (Chọn cửa hàng gần nhất)
                  </p>
                </div>
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                  <p className="text-sm">
                    <strong>Khuyến mãi:</strong> Miễn phí ship toàn quốc cho đơn hàng từ 500.000đ
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 5 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-2 border-gray-200 rounded-sm p-8"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center text-2xl">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6" />
                  <h2 className="text-2xl uppercase tracking-wide">Thanh Toán</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Phương thức thanh toán:</strong>
                  </p>
                  <p>
                    • <strong>COD</strong> - Thanh toán khi nhận hàng (Áp dụng toàn quốc)
                  </p>
                  <p>
                    • <strong>Chuyển khoản ngân hàng</strong> - Giảm 2% (Quét QR hoặc nhập STK)
                  </p>
                  <p>
                    • <strong>Thẻ ATM/Visa/MasterCard</strong> - Thanh toán trực tuyến an toàn
                  </p>
                  <p>
                    • <strong>Ví điện tử</strong> - MoMo, ZaloPay, VNPay (Nhiều ưu đãi)
                  </p>
                  <p>
                    • <strong>Trả góp 0%</strong> - Qua thẻ tín dụng (Cho đơn từ 3 triệu)
                  </p>
                </div>
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                  <p className="text-sm">
                    <strong>An toàn:</strong> Mọi giao dịch được mã hóa SSL 256-bit
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 6 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-black text-white border-2 border-black rounded-sm p-8"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-white text-black rounded-sm flex items-center justify-center text-2xl">
                6
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6" />
                  <h2 className="text-2xl uppercase tracking-wide">Hoàn Tất Đơn Hàng</h2>
                </div>
                <div className="space-y-3">
                  <p>• Kiểm tra lại toàn bộ thông tin đơn hàng</p>
                  <p>
                    • Nhấn <strong>&quot;XÁC NHẬN ĐẶT HÀNG&quot;</strong>
                  </p>
                  <p>• Nhận email/SMS xác nhận đơn hàng ngay lập tức</p>
                  <p>• Theo dõi đơn hàng qua link trong email hoặc tài khoản TheWhite</p>
                  <p>• Nhận thông báo khi đơn hàng đang được giao</p>
                  <p>• Kiểm tra hàng kỹ trước khi thanh toán (với COD)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50 border-2 border-gray-200 rounded-sm p-8"
          >
            <h2 className="text-2xl uppercase tracking-wide mb-6 text-center">
              Mẹo Mua Sắm Thông Minh
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="uppercase tracking-wide mb-2">✓ Đăng ký tài khoản</h3>
                <p className="text-gray-600 text-sm">
                  Để lưu địa chỉ, theo dõi đơn hàng và nhận ưu đãi độc quyền
                </p>
              </div>
              <div>
                <h3 className="uppercase tracking-wide mb-2">✓ Theo dõi khuyến mãi</h3>
                <p className="text-gray-600 text-sm">
                  Đăng ký email để nhận mã giảm giá và flash sale
                </p>
              </div>
              <div>
                <h3 className="uppercase tracking-wide mb-2">✓ Mua nhiều tiết kiệm hơn</h3>
                <p className="text-gray-600 text-sm">
                  Combo 3 sản phẩm giảm 10%, từ 5 sản phẩm giảm 15%
                </p>
              </div>
              <div>
                <h3 className="uppercase tracking-wide mb-2">✓ Tham gia Loyalty Program</h3>
                <p className="text-gray-600 text-sm">
                  Tích điểm mỗi đơn hàng, đổi quà và nhận ưu đãi VIP
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-2xl uppercase tracking-wide mb-4">Sẵn Sàng Mua Sắm?</h2>
            <p className="text-gray-600 mb-6">
              Khám phá bộ sưu tập thể thao cao cấp TheWhite ngay hôm nay!
            </p>
            <Link
              href="/products"
              className="inline-block bg-black text-white px-8 py-4 rounded-sm hover:bg-gray-800 transition-all uppercase tracking-wide"
            >
              Xem Sản Phẩm
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
