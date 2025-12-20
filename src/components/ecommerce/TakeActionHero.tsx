'use client'

import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function TakeActionHero() {
  const router = useRouter()

  const handleExplore = () => {
    router.push('/products')
  }

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Take Action Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-wider font-white">
              TAKE ACTION
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-3xl text-gray-300 mb-12 tracking-wide max-w-4xl mx-auto font-light leading-relaxed"
          >
            HÀNH ĐỘNG ĐỂ TẠO RA SỰ KHÁC BIỆT.
            <br className="hidden md:block" />
            THỜI TRANG THỂ THAO CHO PHONG CÁCH SỐNG NĂNG ĐỘNG.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button
              onClick={handleExplore}
              className="group bg-white text-black px-10 py-5 rounded-none hover:bg-black hover:text-white border-2 border-white transition-all uppercase tracking-[0.1em] font-bold text-sm flex items-center gap-3 hover:scale-105"
            >
              <span>Khám Phá Bộ Sưu Tập</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleExplore}
              className="group border-2 border-white text-white px-10 py-5 rounded-none hover:bg-white hover:text-black transition-all uppercase tracking-[0.1em] font-bold text-sm flex items-center gap-3 hover:scale-105"
            >
              <span>Xem Tất Cả Sản Phẩm</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-gray-400">Cuộn xuống</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-6 h-10 border-2 border-gray-400 rounded-full flex items-start justify-center p-2"
              >
                <motion.div className="w-1 h-2 bg-gray-400 rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full opacity-50" />
      <div className="absolute top-40 right-20 w-3 h-3 bg-white rounded-full opacity-30" />
      <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-white rounded-full opacity-40" />
      <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-white rounded-full opacity-20" />
    </section>
  )
}
