'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'

export function Categories() {
  const categories = [
    {
      label: 'Chạy Bộ',
      count: '120+ Sản phẩm',
      bgColor: 'bg-white',
      textColor: 'text-black',
      borderColor: 'border-white',
      href: '/products?category=running',
    },
    {
      label: 'Gym & Training',
      count: '95+ Sản phẩm',
      bgColor: 'bg-stone-900',
      textColor: 'text-white',
      borderColor: 'border-stone-900',
      href: '/products?category=gym',
    },
    {
      label: 'Yoga & Pilates',
      count: '80+ Sản phẩm',
      bgColor: 'bg-gray-800',
      textColor: 'text-white',
      borderColor: 'border-gray-800',
      href: '/products?category=yoga',
    },
    {
      label: 'Bóng Đá',
      count: '65+ Sản phẩm',
      bgColor: 'bg-white',
      textColor: 'text-black',
      borderColor: 'border-white',
      href: '/products?category=football',
    },
  ]

  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="block text-sm font-bold tracking-[0.2em] mb-4 text-gray-400 uppercase">
              Danh Mục
            </span>
            <h2 className="text-4xl lg:text-7xl uppercase font-heading font-bold tracking-tight leading-none">
              Môn Thể Thao
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-gray-400 max-w-sm text-right md:text-left text-lg font-medium"
          >
            Tìm kiếm trang phục phù hợp nhất cho bộ môn yêu thích của bạn.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`${category.bgColor} ${category.textColor} relative group aspect-[4/5] p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 rounded-none overflow-hidden hover:saturate-150`}
            >
              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-current opacity-20 transition-all duration-300 pointer-events-none" />

              <Link
                href={category.href}
                className="h-full flex flex-col justify-between relative z-10"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold tracking-widest uppercase opacity-60 border-b border-current pb-1">
                    0{index + 1}
                  </span>
                  <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>

                <div>
                  <h3 className="text-2xl lg:text-3xl uppercase font-heading font-bold mb-3 leading-none break-words">
                    {category.label}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-medium opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <span className="uppercase tracking-wider">Khám Phá</span>
                  </div>
                  <div className="text-xs mt-4 opacity-50 font-medium">{category.count}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
