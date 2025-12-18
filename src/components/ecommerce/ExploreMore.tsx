'use client'

import { motion } from 'motion/react'
import { ArrowRight, Zap, TrendingUp, Award, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export function ExploreMore() {
  const router = useRouter()

  const features = [
    {
      icon: Zap,
      title: 'Vận Chuyển Nhanh',
      description: 'Giao hàng toàn quốc trong 1-3 ngày',
    },
    {
      icon: TrendingUp,
      title: 'Chất Lượng Cao',
      description: 'Sản phẩm được kiểm định nghiêm ngặt',
    },
    {
      icon: Award,
      title: 'Bảo Hành Chính Hãng',
      description: 'Cam kết chất lượng 100%',
    },
    {
      icon: Users,
      title: 'Hỗ Trợ 24/7',
      description: 'Đội ngũ tư vấn chuyên nghiệp',
    },
  ]

  const collections = [
    {
      title: 'Mùa Đông 2024',
      description: 'Bộ sưu tập mới nhất với thiết kế độc đáo',
      image:
        'https://images.unsplash.com/photo-1572565408388-cdd3afe23e82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    },
    {
      title: 'Performance Pro',
      description: 'Công nghệ tiên tiến cho vận động viên',
      image:
        'https://images.unsplash.com/photo-1625515922308-56dcaa45351c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    },
    {
      title: 'Casual Sport',
      description: 'Phong cách thể thao cho cuộc sống hàng ngày',
      image:
        'https://images.unsplash.com/photo-1758875568971-7388ba15012b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    },
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">Khám Phá Thêm</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tìm hiểu thêm về các bộ sưu tập và dịch vụ đặc biệt của chúng tôi
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl uppercase tracking-wide mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {collections.map((collection, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative h-96 bg-gray-100 overflow-hidden cursor-pointer rounded-sm"
              onClick={() => router.push('/products')}
            >
              <div className="absolute inset-0">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <h3 className="text-white text-2xl uppercase tracking-wide mb-2">
                  {collection.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4">{collection.description}</p>
                <div className="flex items-center gap-2 text-white group-hover:gap-4 transition-all">
                  <span className="uppercase text-sm tracking-wider">Khám Phá</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={() => router.push('/products')}
            className="group inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-sm hover:bg-gray-800 transition-all uppercase tracking-wider hover:scale-105"
          >
            <span>Xem Tất Cả Sản Phẩm</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border-2 border-gray-200 rounded-sm opacity-30 -rotate-12" />
      <div className="absolute bottom-20 left-10 w-24 h-24 border-2 border-gray-200 rounded-sm opacity-20 rotate-12" />
    </section>
  )
}
