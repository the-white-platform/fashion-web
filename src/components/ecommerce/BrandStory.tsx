'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

export function BrandStory() {
  return (
    <section className="py-20 bg-transparent text-black">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 bg-gray-900 rounded-sm overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
                alt="TheWhite Brand Story"
                fill
                className="object-cover hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-8 left-8 right-8 bg-white text-black p-6 shadow-lg rounded-sm"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-1 font-bold">2024</div>
                  <div className="text-sm text-gray-600">Thành Lập</div>
                </div>
                <div className="border-l border-r border-gray-200">
                  <div className="text-2xl mb-1 font-bold">100%</div>
                  <div className="text-sm text-gray-600">Việt Nam</div>
                </div>
                <div>
                  <div className="text-2xl mb-1 font-bold">∞</div>
                  <div className="text-sm text-gray-600">Đam Mê</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-block border-2 border-black px-4 py-2 tracking-widest rounded-sm text-sm">
              CÂU CHUYỆN THƯƠNG HIỆU
            </div>

            <h2 className="text-4xl lg:text-5xl uppercase leading-tight font-bold">
              TheWhite - Hành Trình Đam Mê
            </h2>

            <div className="space-y-4 text-gray-700">
              <p>
                TheWhite được sinh ra từ niềm đam mê với thể thao và thời trang. Chúng tôi tin rằng
                mỗi người đều xứng đáng có những bộ trang phục thể thao chất lượng cao, không chỉ
                đẹp mà còn giúp họ tự tin trong mọi hoạt động.
              </p>
              <p>
                Với triết lý &quot;Take Action&quot;, chúng tôi khuyến khích mọi người bước ra khỏi
                vùng an toàn, thử thách bản thân và sống một cuộc sống năng động, tích cực hơn.
              </p>
              <p>
                Mỗi sản phẩm của TheWhite đều được thiết kế tỉ mỉ, chọn lọc chất liệu cao cấp và sản
                xuất với quy trình kiểm soát chất lượng nghiêm ngặt để đảm bảo trải nghiệm tốt nhất
                cho khách hàng.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/products"
                className="bg-black text-white px-8 py-4 rounded-sm hover:bg-gray-200 transition-all hover:scale-105"
              >
                Khám Phá Bộ Sưu Tập
              </Link>
              <Link
                href="/contact"
                className="border-2 border-black px-8 py-4 rounded-sm hover:bg-black hover:text-white transition-all hover:scale-105"
              >
                Câu Chuyện Của Chúng Tôi
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-lg mb-2">✓ Chất Liệu Cao Cấp</div>
                <div className="text-sm text-gray-500">Cotton, Polyester cao cấp</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-lg mb-2">✓ Thiết Kế Độc Đáo</div>
                <div className="text-sm text-gray-500">Style hiện đại, tối giản</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-lg mb-2">✓ Bền Bỉ Và Thoáng Khí</div>
                <div className="text-sm text-gray-500">Công nghệ thấm hút tốt</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-lg mb-2">✓ 100% Made in Vietnam</div>
                <div className="text-sm text-gray-500">Tự hào sản xuất tại Việt Nam</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
