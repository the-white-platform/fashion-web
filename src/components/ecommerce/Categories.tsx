'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'

export function Categories() {
  const { t } = useLanguage()

  const categories = [
    {
      key: 'categories.running',
      count: '120+',
      bgColor: 'bg-white',
      textColor: 'text-black',
      href: '/products?category=running',
    },
    {
      key: 'categories.gym',
      count: '95+',
      bgColor: 'bg-gray-900',
      textColor: 'text-white',
      href: '/products?category=gym',
    },
    {
      key: 'categories.yoga',
      count: '80+',
      bgColor: 'bg-gray-800',
      textColor: 'text-white',
      href: '/products?category=yoga',
    },
    {
      key: 'categories.football',
      count: '65+',
      bgColor: 'bg-white',
      textColor: 'text-black',
      href: '/products?category=football',
    },
  ]

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl uppercase mb-4"
          >
            {t('categories.title')}
          </motion.h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{t('categories.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`${category.bgColor} ${category.textColor} p-4 lg:p-8 aspect-square flex flex-col justify-between cursor-pointer transition-shadow hover:shadow-2xl rounded-sm`}
            >
              <Link href={category.href} className="h-full flex flex-col justify-between">
                <div className="text-xs lg:text-sm tracking-widest opacity-80">
                  {category.count} {t('common.products')}
                </div>
                <div>
                  <h3 className="text-lg lg:text-2xl uppercase mb-2 font-bold">
                    {t(category.key)}
                  </h3>
                  <div className="text-xs lg:text-sm underline flex items-center gap-1">
                    {t('common.explore')}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
