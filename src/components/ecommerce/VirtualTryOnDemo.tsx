'use client'

import { motion } from 'motion/react'
import { Sparkles, Upload, User, Ruler, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export function VirtualTryOnDemo() {
  return (
    <section className="py-20 bg-transparent">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm tracking-widest">CÔNG NGHỆ MỚI</span>
          </div>
          <h2 className="text-4xl lg:text-5xl uppercase mb-4">Thử Đồ Ảo</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm công nghệ AI để xem sản phẩm trên người bạn trước khi mua
          </p>
        </motion.div>

        {/* How It Works - 3 Steps */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="bg-white border-2 border-gray-200 rounded-sm p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-xl">1</span>
                  </div>
                  <h3 className="text-xl uppercase tracking-wide">Chọn Sản Phẩm</h3>
                </div>

                {/* Mock Product Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="aspect-square bg-gray-200 rounded-sm relative overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"
                      alt="Product"
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-sm relative overflow-hidden border-2 border-black">
                    <Image
                      src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200"
                      alt="Product"
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                    <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">Chọn sản phẩm bạn muốn thử</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ChevronRight className="w-8 h-8 text-gray-400" />
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white border-2 border-gray-200 rounded-sm p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-xl">2</span>
                  </div>
                  <h3 className="text-xl uppercase tracking-wide">Tải Ảnh Của Bạn</h3>
                </div>

                {/* Mock Upload */}
                <div className="border-2 border-dashed border-gray-400 rounded-sm p-6 mb-4 flex flex-col items-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-600 text-center">Tải ảnh lên</p>
                </div>

                {/* Mock Inputs */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="border-2 border-gray-300 rounded-sm p-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">170 cm</span>
                  </div>
                  <div className="border-2 border-gray-300 rounded-sm p-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">65 kg</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600">Tải ảnh của bạn hoặc nhập số đo cơ thể</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ChevronRight className="w-8 h-8 text-gray-400" />
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white border-2 border-gray-200 rounded-sm p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-xl">3</span>
                  </div>
                  <h3 className="text-xl uppercase tracking-wide">Xem Kết Quả</h3>
                </div>

                {/* Mock Result */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-sm aspect-[3/4] mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-gray-400 animate-pulse" />
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Xem sản phẩm trên người bạn với công nghệ AI
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-black text-white rounded-sm p-12 max-w-4xl mx-auto"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-3xl uppercase mb-4">Trải Nghiệm Ngay</h3>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Thử ngay công nghệ thử đồ ảo để tìm size và style phù hợp nhất
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-sm hover:bg-gray-200 transition-all hover:scale-105 uppercase tracking-wide">
            Thử Đồ Ngay
          </button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto"
        >
          <div className="bg-white border border-gray-300 rounded-sm p-6 text-center">
            <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h4 className="uppercase tracking-wide mb-2">Dễ Dàng Sử Dụng</h4>
            <p className="text-sm text-gray-600">Chỉ cần vài cú click</p>
          </div>

          <div className="bg-white border border-gray-300 rounded-sm p-6 text-center">
            <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="uppercase tracking-wide mb-2">Công Nghệ AI</h4>
            <p className="text-sm text-gray-600">Kết quả chính xác và nhanh chóng</p>
          </div>

          <div className="bg-white border border-gray-300 rounded-sm p-6 text-center">
            <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h4 className="uppercase tracking-wide mb-2">Miễn Phí</h4>
            <p className="text-sm text-gray-600">Sử dụng không giới hạn</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
