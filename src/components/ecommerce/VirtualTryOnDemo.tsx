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
            <span className="text-sm tracking-widest">AI TRY-ON</span>
          </div>
          <h2 className="text-4xl lg:text-5xl uppercase mb-4">Thử Đồ Ảo</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm tính năng AI Try-On độc quyền để xem sản phẩm trên chính cơ thể bạn trước
            khi quyết định mua sắm.
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
            >
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-lg">1</span>
                  </div>
                  <h3 className="text-lg uppercase tracking-wide">Chọn Sản Phẩm</h3>
                </div>

                {/* Mock Product Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="aspect-square bg-gray-200 rounded-sm relative overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"
                      alt="Product"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-sm relative overflow-hidden border-2 border-black">
                    <Image
                      src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200"
                      alt="Product"
                      fill
                      className="object-cover"
                      sizes="200px"
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

                <p className="text-sm text-gray-600">
                  Chọn sản phẩm bạn muốn thử từ bộ sưu tập của chúng tôi
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-lg">2</span>
                  </div>
                  <h3 className="text-lg uppercase tracking-wide">Tải Ảnh Của Bạn</h3>
                </div>

                {/* Mock Upload */}
                <div className="border-2 border-dashed border-gray-400 rounded-sm p-4 mb-3 flex flex-col items-center">
                  <User className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-600 text-center">Tải ảnh toàn thân của bạn</p>
                </div>

                {/* Mock Inputs */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="border-2 border-gray-300 rounded-sm p-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">170 cm</span>
                  </div>
                  <div className="border-2 border-gray-300 rounded-sm p-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">65 kg</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Nhập số đo của bạn để có kết quả chính xác nhất
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white border-2 border-gray-200 rounded-sm p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-lg">3</span>
                  </div>
                  <h3 className="text-lg uppercase tracking-wide">Xem Kết Quả</h3>
                </div>

                {/* Mock Result - More square aspect ratio to match other cards */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-sm aspect-square mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-gray-400 animate-pulse" />
                  </div>
                </div>

                <p className="text-sm text-gray-600">Xem kết quả thử đồ ảo với độ chính xác cao</p>
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
            Công nghệ AI tiên tiến giúp bạn thử đồ trực tuyến một cách chân thực nhất
          </p>
          <button
            onClick={() => (window.location.href = '/products')}
            className="bg-white text-black px-8 py-4 rounded-sm hover:bg-gray-200 transition-all hover:scale-105 uppercase tracking-wide"
          >
            Bắt Đầu Ngay
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
            <h4 className="uppercase tracking-wide mb-2">Tải Ảnh Nhanh</h4>
            <p className="text-sm text-gray-600">Chỉ cần vài giây để tải ảnh lên và bắt đầu</p>
          </div>

          <div className="bg-white border border-gray-300 rounded-sm p-6 text-center">
            <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="uppercase tracking-wide mb-2">AI Thông Minh</h4>
            <p className="text-sm text-gray-600">Công nghệ AI học sâu cho kết quả chính xác</p>
          </div>

          <div className="bg-white border border-gray-300 rounded-sm p-6 text-center">
            <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h4 className="uppercase tracking-wide mb-2">Cá Nhân Hóa</h4>
            <p className="text-sm text-gray-600">Tùy chỉnh theo số đo cơ thể của bạn</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
