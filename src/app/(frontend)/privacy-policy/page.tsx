'use client'

import { Shield, Lock, Eye, UserCheck, FileText, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Shield,
      title: '1. Giới Thiệu',
      content: `TheWhite cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn theo quy định của GDPR (General Data Protection Regulation) và pháp luật Việt Nam.

Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi sử dụng website và dịch vụ của TheWhite.`,
    },
    {
      icon: FileText,
      title: '2. Thông Tin Chúng Tôi Thu Thập',
      content: `**Thông tin bạn cung cấp:**
• Họ tên, địa chỉ email, số điện thoại
• Địa chỉ giao hàng và thanh toán
• Thông tin tài khoản (username, password đã mã hóa)
• Thông tin đơn hàng và lịch sử mua sắm
• Phản hồi, đánh giá sản phẩm

**Thông tin tự động thu thập:**
• Địa chỉ IP, loại trình duyệt, hệ điều hành
• Cookies và công nghệ theo dõi tương tự
• Dữ liệu sử dụng website (trang xem, thời gian truy cập)
• Dữ liệu phân tích từ Google Analytics

**Cơ sở pháp lý:**
• Thực hiện hợp đồng mua bán
• Lợi ích hợp pháp trong kinh doanh
• Sự đồng ý của bạn`,
    },
    {
      icon: UserCheck,
      title: '3. Mục Đích Sử Dụng Dữ Liệu',
      content: `Chúng tôi sử dụng dữ liệu của bạn để:

✓ Xử lý và giao đơn hàng
✓ Gửi xác nhận đơn hàng và cập nhật vận chuyển
✓ Cung cấp dịch vụ chăm sóc khách hàng
✓ Xử lý thanh toán (qua đối tác thanh toán bảo mật)
✓ Cải thiện trải nghiệm người dùng và cá nhân hóa nội dung
✓ Gửi thông tin khuyến mãi (chỉ khi bạn đồng ý)
✓ Phân tích và nghiên cứu thị trường
✓ Phát hiện và ngăn chặn gian lận
✓ Tuân thủ nghĩa vụ pháp lý`,
    },
    {
      icon: Lock,
      title: '4. Bảo Mật Dữ Liệu',
      content: `**Biện pháp bảo mật:**
• Mã hóa SSL/TLS cho mọi truyền tải dữ liệu
• Lưu trữ password dạng băm (hashed) với bcrypt
• Firewall và hệ thống phát hiện xâm nhập
• Kiểm soát truy cập dựa trên vai trò
• Sao lưu dữ liệu định kỳ và mã hóa
• Đào tạo nhân viên về bảo mật thông tin

**Thời gian lưu trữ:**
• Dữ liệu tài khoản: Cho đến khi bạn yêu cầu xóa
• Dữ liệu đơn hàng: 5 năm (yêu cầu pháp lý kế toán)
• Dữ liệu marketing: 2 năm hoặc cho đến khi từ chối
• Cookie: Tùy loại (session hoặc 1-12 tháng)`,
    },
    {
      icon: Eye,
      title: '5. Chia Sẻ Dữ Liệu',
      content: `Chúng tôi chỉ chia sẻ dữ liệu với các bên thứ ba tin cậy:

**Đối tác dịch vụ:**
• Đơn vị vận chuyển (Giao Hàng Nhanh, Viettel Post)
• Cổng thanh toán (VNPay, MoMo - tuân thủ PCI DSS)
• Dịch vụ email marketing (chỉ khi bạn đồng ý)
• Google Analytics (dữ liệu ẩn danh)

**Yêu cầu pháp lý:**
• Khi có lệnh từ cơ quan có thẩm quyền
• Bảo vệ quyền và an toàn của TheWhite và khách hàng

Chúng tôi **KHÔNG** bán hoặc cho thuê dữ liệu cá nhân của bạn.`,
    },
    {
      icon: UserCheck,
      title: '6. Quyền Của Bạn Theo GDPR',
      content: `Bạn có các quyền sau:

**Quyền truy cập:** Yêu cầu bản sao dữ liệu cá nhân của bạn

**Quyền chỉnh sửa:** Cập nhật thông tin không chính xác

**Quyền xóa ("Right to be Forgotten"):** Yêu cầu xóa dữ liệu của bạn

**Quyền hạn chế xử lý:** Tạm dừng xử lý dữ liệu trong trường hợp cụ thể

**Quyền di chuyển dữ liệu:** Nhận dữ liệu ở định dạng có thể đọc được

**Quyền phản đối:** Từ chối xử lý dữ liệu cho mục đích marketing

**Quyền rút lại đồng ý:** Hủy đồng ý đã cung cấp bất kỳ lúc nào

**Cách thực hiện quyền:**
📧 Email: privacy@thewhite.vn
📞 Hotline: 0123 456 789
⏱️ Thời gian phản hồi: 30 ngày`,
    },
  ]

  return (
    <div className="min-h-screen bg-white pt-32 pb-12">
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
                <BreadcrumbPage>Chính Sách Bảo Mật</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-sm mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">Chính Sách Bảo Mật</h1>
          <p className="text-gray-600 text-lg">Tuân thủ GDPR & Luật Bảo Vệ Dữ Liệu Việt Nam</p>
          <p className="text-sm text-gray-500 mt-2">Cập nhật lần cuối: 17/12/2024</p>
        </motion.div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-sm border border-gray-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl uppercase tracking-wide pt-2">{section.title}</h2>
                </div>
                <div className="pl-16">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gray-50 p-8 rounded-sm border border-gray-200 mt-8"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4">7. Chuyển Giao Dữ Liệu Quốc Tế</h2>
          <p className="text-gray-700 leading-relaxed">
            Một số đối tác của chúng tôi có thể đặt tại nước ngoài (ví dụ: máy chủ AWS tại
            Singapore). Chúng tôi đảm bảo mọi chuyển giao dữ liệu tuân thủ GDPR thông qua:
            <br />
            <br />• Standard Contractual Clauses (SCC) được EU phê duyệt
            <br />• Đối tác có chứng nhận ISO 27001
            <br />• Thỏa thuận bảo vệ dữ liệu đầy đủ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gray-50 p-8 rounded-sm border border-gray-200 mt-8"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4">8. Quyền Riêng Tư Của Trẻ Em</h2>
          <p className="text-gray-700 leading-relaxed">
            Website của chúng tôi không nhắm đến trẻ em dưới 16 tuổi. Chúng tôi không cố ý thu thập
            dữ liệu cá nhân của trẻ em. Nếu bạn là phụ huynh và phát hiện con mình đã cung cấp thông
            tin, vui lòng liên hệ ngay để chúng tôi xóa dữ liệu.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-gray-50 p-8 rounded-sm border border-gray-200 mt-8"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4">9. Thay Đổi Chính Sách</h2>
          <p className="text-gray-700 leading-relaxed">
            Chúng tôi có thể cập nhật chính sách này định kỳ. Thay đổi quan trọng sẽ được thông báo
            qua:
            <br />
            <br />• Email đến địa chỉ đã đăng ký
            <br />• Thông báo nổi bật trên website
            <br />• Popup thông báo khi đăng nhập
            <br />
            <br />
            Việc tiếp tục sử dụng dịch vụ sau thay đổi đồng nghĩa với việc chấp nhận chính sách mới.
          </p>
        </motion.div>

        {/* Contact DPO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-black text-white p-8 rounded-sm mt-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6" />
            <h2 className="text-2xl uppercase tracking-wide">
              10. Liên Hệ - Data Protection Officer
            </h2>
          </div>
          <p className="leading-relaxed mb-4">
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật hoặc muốn thực hiện quyền của mình,
            vui lòng liên hệ Data Protection Officer (DPO) của chúng tôi:
          </p>
          <div className="space-y-2 bg-white/10 p-4 rounded-sm">
            <p>
              <strong>Email:</strong> privacy@thewhite.vn
            </p>
            <p>
              <strong>Hotline:</strong> 0123 456 789
            </p>
            <p>
              <strong>Địa chỉ:</strong> TheWhite Vietnam, Quận 1, TP. Hồ Chí Minh
            </p>
            <p>
              <strong>Giờ làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ Nhật)
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-300">
            Bạn cũng có quyền khiếu nại với Cơ quan Bảo vệ Dữ liệu có thẩm quyền nếu cho rằng quyền
            của bạn bị vi phạm.
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-4 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-wider"
          >
            Quay Lại Trang Chủ
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
