'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

export function Categories() {
  const t = useTranslations('categories')
  const tCommon = useTranslations('common')

  const categories = [
    {
      label: t('running'),
      count: `120+ ${tCommon('products')}`,
      bgColor: 'bg-card',
      textColor: 'text-card-foreground',
      borderColor: 'border-border',
      href: '/products?category=running',
    },
    {
      label: t('gym'),
      count: `95+ ${tCommon('products')}`,
      bgColor: 'bg-primary',
      textColor: 'text-primary-foreground',
      borderColor: 'border-primary',
      href: '/products?category=gym',
    },
    {
      label: t('yoga'),
      count: `80+ ${tCommon('products')}`,
      bgColor: 'bg-secondary',
      textColor: 'text-secondary-foreground',
      borderColor: 'border-secondary',
      href: '/products?category=yoga',
    },
    {
      label: t('football'),
      count: `65+ ${tCommon('products')}`,
      bgColor: 'bg-muted',
      textColor: 'text-foreground',
      borderColor: 'border-muted',
      href: '/products?category=football',
    },
  ]

  return (
    <section className="py-24 text-foreground">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl lg:text-6xl uppercase font-heading font-bold tracking-tight leading-none">
              {t('title')}
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-sm text-right md:text-left text-lg font-medium"
          >
            {t('subtitle')}
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
              className={`${category.bgColor} ${category.textColor} relative group aspect-[4/5] p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 rounded-none overflow-hidden hover:shadow-xl`}
            >
              {/* Hover Border Effect */}
              <div
                className={`absolute inset-0 border-2 ${category.borderColor} opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
              />

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
                  <h3 className="text-3xl font-black uppercase mb-2 tracking-wide break-words">
                    {category.label}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                    {category.count}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
