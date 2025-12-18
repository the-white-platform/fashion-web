'use client'

import { FileText, ShoppingBag, AlertTriangle, Scale, UserX, RefreshCw } from 'lucide-react'
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

export default function TermsOfUsePage() {
  const sections = [
    {
      icon: FileText,
      title: '1. Chấp Nhận Điều Khoản',
      content: `Bằng việc truy cập và sử dụng website TheWhite (www.thewhite.vn), bạn đồng ý tuân thủ các điều khoản và điều kiện sử dụng này.

Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng không sử dụng dịch vụ của chúng tôi.

Chúng tôi có quyền thay đổi điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.`,
    },
    {
      icon: UserX,
      title: '2. Tài Khoản Người Dùng',
      content: `**Đăng ký tài khoản:**
• Bạn phải từ 16 tuổi trở lên để tạo tài khoản
• Thông tin đăng ký phải chính xác và đầy đủ
• Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu
• Bạn phải thông báo ngay nếu phát hiện truy cập trái phép

**Quyền hạn của chúng tôi:**
• Từ chối hoặc hủy đăng ký mà không cần lý do
• Đình chỉ/xóa tài khoản vi phạm điều khoản
• Yêu cầu xác minh danh tính bổ sung

**Nghĩa vụ của bạn:**
• Không chia sẻ tài khoản cho người khác
• Không sử dụng cho mục đích thương mại trái phép
• Không tạo nhiều tài khoản để lạm dụng khuyến mãi`,
    },
    {
      icon: ShoppingBag,
      title: '3. Đơn Hàng & Thanh Toán',
      content: `**Quy trình đặt hàng:**
1. Chọn sản phẩm và thêm vào giỏ hàng
2. Điền thông tin giao hàng và thanh toán
3. Xác nhận đơn hàng và thanh toán
4. Nhận email xác nhận đơn hàng

**Giá cả & Thanh toán:**
• Giá hiển thị bằng VND, đã bao gồm VAT
• Chúng tôi có quyền thay đổi giá bất kỳ lúc nào
• Phương thức: COD, chuyển khoản, thẻ tín dụng, ví điện tử
• Đơn hàng chỉ được xử lý sau khi thanh toán thành công

**Hủy đơn hàng:**
• Bạn có thể hủy trước khi đơn được giao cho vận chuyển
• Hoàn tiền trong 5-7 ngày làm việc (nếu đã thanh toán)
• Chúng tôi có quyền hủy đơn nếu phát hiện gian lận`,
    },
    {
      icon: RefreshCw,
      title: '4. Vận Chuyển & Giao Hàng',
      content: `**Khu vực giao hàng:**
• Toàn quốc qua đối tác vận chuyển uy tín
• Thời gian: 2-5 ngày (nội thành), 3-7 ngày (tỉnh xa)
• Phí vận chuyển: Theo chính sách hiện hành

**Trách nhiệm:**
• Chúng tôi không chịu trách nhiệm cho sự chậm trễ do đối tác vận chuyển
• Bạn phải kiểm tra hàng trước khi nhận (đối với COD)
• Khiếu nại phải được gửi trong 24h sau khi nhận hàng

**Rủi ro:**
• Rủi ro chuyển sang bạn khi hàng được giao thành công
• Bạn chịu trách nhiệm cung cấp địa chỉ chính xác`,
    },
    {
      icon: Scale,
      title: '5. Sở Hữu Trí Tuệ',
      content: `**Bản quyền:**
• Mọi nội dung trên website (văn bản, hình ảnh, logo, video) thuộc quyền sở hữu của TheWhite
• Logo "TheWhite" là thương hiệu đã đăng ký
• Thiết kế website được bảo vệ bởi luật bản quyền

**Giới hạn sử dụng:**
• Bạn có thể xem và tải xuống cho mục đích cá nhân
• Không được sao chép, phân phối, hoặc sử dụng thương mại
• Không được tạo ra sản phẩm phái sinh

**Vi phạm:**
• Chúng tôi sẽ thực hiện biện pháp pháp lý nếu phát hiện vi phạm bản quyền`,
    },
    {
      icon: AlertTriangle,
      title: '6. Trách Nhiệm & Giới Hạn',
      content: `**Từ chối bảo đảm:**
• Website cung cấp "nguyên trạng" (as-is)
• Chúng tôi không đảm bảo website luôn hoạt động liên tục
• Không chịu trách nhiệm cho lỗi kỹ thuật, virus, malware

**Giới hạn trách nhiệm:**
• Chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp, ngẫu nhiên, hoặc hậu quả
• Trách nhiệm tối đa: Giá trị đơn hàng liên quan
• Không áp dụng cho thiệt hại do sơ suất nghiêm trọng

**Bồi thường:**
• Bạn đồng ý bồi thường cho TheWhite nếu vi phạm điều khoản gây thiệt hại

**Bất khả kháng:**
• Chúng tôi không chịu trách nhiệm cho sự kiện ngoài tầm kiểm soát (thiên tai, chiến tranh, dịch bệnh)`,
    },
  ]

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
                <BreadcrumbPage>Điều Khoản Sử Dụng</BreadcrumbPage>
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
            <Scale className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">Điều Khoản Sử Dụng</h1>
          <p className="text-gray-600 text-lg">Quy định sử dụng dịch vụ TheWhite</p>
          <p className="text-sm text-gray-500 mt-2">Có hiệu lực từ: 17/12/2024</p>
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
          <h2 className="text-2xl uppercase tracking-wide mb-4">7. Hành Vi Bị Cấm</h2>
          <div className="text-gray-700 leading-relaxed">
            <p className="mb-3">Khi sử dụng dịch vụ, bạn KHÔNG ĐƯỢC:</p>
            <ul className="space-y-2 ml-6">
              <li>❌ Vi phạm luật pháp Việt Nam hoặc quốc tế</li>
              <li>❌ Sử dụng cho mục đích gian lận, rửa tiền</li>
              <li>❌ Tải lên virus, malware hoặc mã độc hại</li>
              <li>❌ Cố gắng truy cập trái phép vào hệ thống</li>
              <li>❌ Thu thập thông tin người dùng khác</li>
              <li>❌ Mạo danh TheWhite hoặc nhân viên của chúng tôi</li>
              <li>❌ Spam, quấy rối, hoặc hành vi gây phiền nhiễu</li>
              <li>❌ Sử dụng bot, script tự động để mua hàng</li>
              <li>❌ Đăng nội dung vi phạm bản quyền</li>
              <li>❌ Lợi dụng lỗi hệ thống để trục lợi</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gray-50 p-8 rounded-sm border border-gray-200 mt-8"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4">8. Liên Kết Bên Thứ Ba</h2>
          <p className="text-gray-700 leading-relaxed">
            Website có thể chứa liên kết đến các trang web của bên thứ ba. Chúng tôi không kiểm soát
            và không chịu trách nhiệm về nội dung, chính sách bảo mật, hoặc thực hành của các trang
            này.
            <br />
            <br />
            Việc truy cập các liên kết bên ngoài là do bạn tự chịu trách nhiệm. Chúng tôi khuyến
            khích bạn đọc kỹ điều khoản và chính sách bảo mật của mọi trang web bạn truy cập.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-gray-50 p-8 rounded-sm border border-gray-200 mt-8"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4">9. Giải Quyết Tranh Chấp</h2>
          <div className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              <strong>Luật điều chỉnh:</strong> Điều khoản này tuân theo pháp luật Việt Nam.
            </p>
            <p className="mb-4">
              <strong>Thương lượng:</strong> Các tranh chấp phải được giải quyết thông qua thương
              lượng hòa giải trước.
            </p>
            <p className="mb-4">
              <strong>Tòa án:</strong> Nếu không thương lượng được, tranh chấp sẽ được giải quyết
              tại Tòa án có thẩm quyền tại TP. Hồ Chí Minh.
            </p>
            <p>
              <strong>Ngôn ngữ:</strong> Phiên bản tiếng Việt của điều khoản này là phiên bản chính
              thức. Trong trường hợp có mâu thuẫn với phiên bản tiếng khác, phiên bản tiếng Việt sẽ
              được ưu tiên.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gray-50 p-8 rounded-sm border border-gray-200 mt-8"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4">10. Tính Riêng Biệt</h2>
          <p className="text-gray-700 leading-relaxed">
            Nếu bất kỳ điều khoản nào trong tài liệu này được xác định là không hợp lệ hoặc không
            thể thi hành, các điều khoản còn lại vẫn giữ nguyên hiệu lực.
            <br />
            <br />
            Việc chúng tôi không thực thi bất kỳ quyền nào không được coi là từ bỏ quyền đó.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="bg-black text-white p-8 rounded-sm mt-8"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4">11. Liên Hệ</h2>
          <p className="leading-relaxed mb-4">
            Nếu bạn có câu hỏi về các điều khoản này, vui lòng liên hệ:
          </p>
          <div className="space-y-2 bg-white/10 p-4 rounded-sm">
            <p>
              <strong>Công ty:</strong> TheWhite Vietnam
            </p>
            <p>
              <strong>Email:</strong> legal@thewhite.vn
            </p>
            <p>
              <strong>Hotline:</strong> 0123 456 789
            </p>
            <p>
              <strong>Địa chỉ:</strong> Quận 1, TP. Hồ Chí Minh, Việt Nam
            </p>
            <p>
              <strong>Giờ làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ Nhật)
            </p>
          </div>
        </motion.div>

        {/* Acceptance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-sm mt-8"
        >
          <p className="text-center">
            <strong className="uppercase tracking-wide">Quan Trọng:</strong>
            <br />
            Bằng việc sử dụng website TheWhite, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ
            các điều khoản và điều kiện nêu trên.
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
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
