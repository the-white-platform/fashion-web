'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronDown,
  ChevronLeft,
  Search,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const categories = [
  { id: 'all', label: 'Tất Cả', icon: HelpCircle },
  { id: 'order', label: 'Đặt Hàng', icon: Package },
  { id: 'payment', label: 'Thanh Toán', icon: CreditCard },
  { id: 'shipping', label: 'Vận Chuyển', icon: Truck },
  { id: 'return', label: 'Đổi Trả', icon: RefreshCw },
]

const faqs = [
  {
    id: '1',
    category: 'order',
    question: 'Làm thế nào để đặt hàng trên TheWhite?',
    answer:
      'Bạn có thể đặt hàng dễ dàng bằng cách: 1) Chọn sản phẩm và thêm vào giỏ hàng 2) Điền thông tin giao hàng 3) Chọn phương thức thanh toán 4) Xác nhận đơn hàng. Bạn sẽ nhận được email xác nhận ngay sau khi đặt hàng thành công.',
  },
  {
    id: '2',
    category: 'order',
    question: 'Tôi có thể thay đổi hoặc hủy đơn hàng không?',
    answer:
      'Bạn có thể hủy đơn hàng trong vòng 24h sau khi đặt hàng nếu đơn hàng chưa được xác nhận. Để thay đổi hoặc hủy đơn, vui lòng liên hệ hotline 1900-xxxx hoặc qua trang "Đơn Hàng Của Tôi" trong tài khoản.',
  },
  {
    id: '3',
    category: 'order',
    question: 'Tôi có cần tạo tài khoản để mua hàng không?',
    answer:
      'Không bắt buộc. Bạn có thể mua hàng với tư cách khách (Guest Checkout). Tuy nhiên, tạo tài khoản giúp bạn theo dõi đơn hàng dễ dàng hơn, lưu địa chỉ giao hàng và nhận ưu đãi đặc biệt.',
  },
  {
    id: '4',
    category: 'payment',
    question: 'TheWhite chấp nhận những phương thức thanh toán nào?',
    answer:
      'Chúng tôi chấp nhận: 1) Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB) 2) Chuyển khoản ngân hàng 3) Ví điện tử MoMo 4) Thanh toán khi nhận hàng (COD). Tất cả giao dịch đều được mã hóa và bảo mật.',
  },
  {
    id: '5',
    category: 'payment',
    question: 'Thanh toán khi nhận hàng (COD) có phí không?',
    answer:
      'Phí COD là 20.000₫ cho đơn hàng dưới 500.000₫. Miễn phí COD cho đơn hàng từ 500.000₫ trở lên.',
  },
  {
    id: '6',
    category: 'payment',
    question: 'Thông tin thẻ của tôi có an toàn không?',
    answer:
      'Hoàn toàn an toàn. Chúng tôi sử dụng công nghệ mã hóa SSL và không lưu trữ thông tin thẻ trên hệ thống. Mọi giao dịch đều được xử lý qua cổng thanh toán bảo mật quốc tế.',
  },
  {
    id: '7',
    category: 'shipping',
    question: 'Thời gian giao hàng là bao lâu?',
    answer:
      'Nội thành TP.HCM/Hà Nội: 1-2 ngày làm việc. Các tỉnh thành khác: 2-5 ngày làm việc. Vùng sâu vùng xa: 5-7 ngày làm việc. Thời gian có thể thay đổi tùy tình hình thực tế.',
  },
  {
    id: '8',
    category: 'shipping',
    question: 'Phí vận chuyển là bao nhiêu?',
    answer:
      'Miễn phí vận chuyển cho đơn hàng từ 500.000₫. Đơn hàng dưới 500.000₫: phí vận chuyển 30.000₫ (nội thành) hoặc 50.000₫ (ngoại thành/tỉnh).',
  },
  {
    id: '9',
    category: 'shipping',
    question: 'Tôi có thể theo dõi đơn hàng như thế nào?',
    answer:
      'Sau khi đơn hàng được xác nhận, bạn sẽ nhận được mã vận đơn qua email/SMS. Bạn có thể theo dõi đơn hàng trong mục "Đơn Hàng Của Tôi" hoặc qua mã vận đơn trên website đơn vị vận chuyển.',
  },
  {
    id: '10',
    category: 'shipping',
    question: 'Tôi có thể chỉ định thời gian giao hàng không?',
    answer:
      'Hiện tại chúng tôi chưa hỗ trợ chỉ định giờ giao cụ thể, nhưng bạn có thể ghi chú thời gian mong muốn trong phần "Ghi chú đơn hàng". Chúng tôi sẽ cố gắng đáp ứng.',
  },
  {
    id: '11',
    category: 'return',
    question: 'Chính sách đổi trả của TheWhite như thế nào?',
    answer:
      'Bạn có thể đổi/trả hàng trong vòng 30 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng. Chúng tôi hỗ trợ đổi size miễn phí và hoàn tiền 100% cho sản phẩm lỗi.',
  },
  {
    id: '12',
    category: 'return',
    question: 'Làm thế nào để yêu cầu đổi/trả hàng?',
    answer:
      'Truy cập "Đơn Hàng Của Tôi" > Chọn đơn hàng cần đổi/trả > Nhấn "Yêu Cầu Đổi/Trả". Điền thông tin và lý do, chụp ảnh sản phẩm nếu có lỗi. Chúng tôi sẽ xử lý trong vòng 24-48h.',
  },
  {
    id: '13',
    category: 'return',
    question: 'Phí đổi trả là bao nhiêu?',
    answer:
      'Miễn phí đổi size lần đầu. Miễn phí trả hàng nếu sản phẩm lỗi/nhầm hàng. Đổi trả do lỗi chủ quan (đổi ý): phí vận chuyển 2 chiều do khách hàng chi trả.',
  },
  {
    id: '14',
    category: 'return',
    question: 'Khi nào tôi nhận được hoàn tiền?',
    answer:
      'Sau khi chúng tôi nhận và kiểm tra sản phẩm trả lại (2-3 ngày), tiền sẽ được hoàn về tài khoản/thẻ trong vòng 5-7 ngày làm việc tùy ngân hàng.',
  },
  {
    id: '15',
    category: 'order',
    question: 'Làm sao để biết size nào phù hợp với tôi?',
    answer:
      'Sử dụng "Hướng Dẫn Chọn Size" trên mỗi trang sản phẩm. Chúng tôi cũng có tính năng "AI Smart Size Selection" giúp gợi ý size dựa trên số đo cơ thể của bạn. Nếu vẫn không chắc chắn, hãy liên hệ tư vấn viên qua chat.',
  },
  {
    id: '16',
    category: 'order',
    question: 'Sản phẩm tôi muốn đã hết hàng, khi nào có lại?',
    answer:
      'Nhấn nút "Thông Báo Khi Có Hàng" trên trang sản phẩm. Chúng tôi sẽ gửi email/SMS ngay khi sản phẩm về hàng. Thời gian nhập hàng thường từ 1-2 tuần.',
  },
  {
    id: '17',
    category: 'payment',
    question: 'Tôi có thể sử dụng nhiều mã giảm giá cùng lúc không?',
    answer:
      'Mỗi đơn hàng chỉ áp dụng được 1 mã giảm giá. Hệ thống sẽ tự động chọn mã có lợi nhất cho bạn.',
  },
  {
    id: '18',
    category: 'order',
    question: 'TheWhite có cửa hàng offline không?',
    answer:
      'Có, chúng tôi có cửa hàng tại TP.HCM và Hà Nội. Xem địa chỉ chi tiết tại mục "Cửa Hàng" hoặc liên hệ hotline để được hướng dẫn.',
  },
]

export default function FAQPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="container mx-auto px-6 max-w-5xl">
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
                <BreadcrumbPage>Câu Hỏi Thường Gặp</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl uppercase tracking-wide mb-4">Câu Hỏi Thường Gặp</h1>
          <p className="text-gray-600">Tìm câu trả lời cho những câu hỏi phổ biến về TheWhite</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="pl-12 py-4 text-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.id)}
                className="uppercase tracking-wide"
              >
                <Icon className="w-5 h-5 mr-2" />
                {cat.label}
              </Button>
            )
          })}
        </div>

        {/* FAQs */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.map((faq) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-gray-200 rounded-sm overflow-hidden"
            >
              <Accordion type="single" collapsible>
                <AccordionItem value={faq.id} className="border-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                    <span className="text-left text-lg pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Không tìm thấy câu hỏi phù hợp</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-black text-white rounded-sm p-8 text-center"
        >
          <h3 className="text-2xl uppercase tracking-wide mb-4">Không Tìm Thấy Câu Trả Lời?</h3>
          <p className="text-gray-300 mb-6">
            Đội ngũ hỗ trợ của TheWhite sẵn sàng giúp đỡ bạn 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/contact">Chat Với Chúng Tôi</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black"
              asChild
            >
              <Link href="/contact">Gọi Hotline: 1900-xxxx</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
