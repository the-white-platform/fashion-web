'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

interface ActivityCategory {
  id: number
  title: string
  slug: string
  productCount?: number
}

interface CategoriesProps {
  categories?: ActivityCategory[]
}

export function Categories({ categories }: CategoriesProps = {}) {
  const t = useTranslations('categories')
  const tCommon = useTranslations('common')

  // Color schemes for the cards
  const colorSchemes = [
    {
      bgColor: 'bg-card',
      textColor: 'text-card-foreground',
      borderColor: 'border-border',
    },
    {
      bgColor: 'bg-primary',
      textColor: 'text-primary-foreground',
      borderColor: 'border-primary',
    },
    {
      bgColor: 'bg-secondary',
      textColor: 'text-secondary-foreground',
      borderColor: 'border-secondary',
    },
    {
      bgColor: 'bg-muted',
      textColor: 'text-foreground',
      borderColor: 'border-muted',
    },
  ]

  // Map categories to display format
  const displayCategories =
    categories?.map((cat, index) => ({
      label: cat.title,
      count: cat.productCount ? `${cat.productCount}+ ${tCommon('products')}` : tCommon('products'),
      ...colorSchemes[index % colorSchemes.length],
      href: `/products?category=${cat.slug}`,
    })) || []

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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {displayCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`${category.bgColor} ${category.textColor} relative group aspect-[3/2] p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 rounded-lg overflow-hidden hover:shadow-lg`}
            >
              {/* Hover Border Effect */}
              <div
                className={`absolute inset-0 border-2 ${category.borderColor} opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-lg`}
              />

              <Link
                href={category.href}
                className="h-full flex flex-col justify-between relative z-10"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">
                    0{index + 1}
                  </span>
                  <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>

                <div>
                  <h3 className="text-lg lg:text-xl font-black uppercase mb-1 tracking-wide break-words leading-tight">
                    {category.label}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
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
