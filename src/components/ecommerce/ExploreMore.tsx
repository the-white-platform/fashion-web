'use client'

import { motion } from 'motion/react'
import { ArrowRight, Zap, TrendingUp, Award, Users } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface Category {
  id: number
  title: string
  slug: string
}

interface ExploreMoreProps {
  categories?: Category[]
}

export function ExploreMore({ categories }: ExploreMoreProps = {}) {
  const router = useRouter()
  const t = useTranslations('exploreMore')
  const tCommon = useTranslations('common')

  const features = [
    {
      icon: Zap,
      title: t('feature1.title'),
      description: t('feature1.desc'),
    },
    {
      icon: TrendingUp,
      title: t('feature2.title'),
      description: t('feature2.desc'),
    },
    {
      icon: Award,
      title: t('feature3.title'),
      description: t('feature3.desc'),
    },
    {
      icon: Users,
      title: t('feature4.title'),
      description: t('feature4.desc'),
    },
  ]

  // Map categories to collections with translated descriptions
  const collections =
    categories?.map((cat, index) => {
      const descriptionKeys = ['collection1.desc', 'collection2.desc', 'collection3.desc']
      const images = [
        'https://images.unsplash.com/photo-1572565408388-cdd3afe23e82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
        'https://images.unsplash.com/photo-1625515922308-56dcaa45351c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
        'https://images.unsplash.com/photo-1758875568971-7388ba15012b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      ]

      return {
        title: cat.title,
        description: t(descriptionKeys[index] as any) || '',
        image: images[index] || images[0],
        link: `/products?category=${cat.slug}`,
      }
    }) || []

  return (
    <section className="py-20 relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide text-foreground">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
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
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl uppercase tracking-wide mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
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
              className="group relative h-96 bg-muted overflow-hidden cursor-pointer rounded-sm"
              onClick={() => router.push(collection.link)}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <h3 className="text-white text-2xl uppercase tracking-wide mb-2 font-bold">
                  {collection.title}
                </h3>
                <p className="text-gray-200 text-sm mb-4">{collection.description}</p>
                <div className="flex items-center gap-2 text-white group-hover:gap-4 transition-all">
                  <span className="uppercase text-sm tracking-wider font-medium">
                    {tCommon('explore')}
                  </span>
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
            className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-sm hover:bg-primary/90 transition-all uppercase tracking-wider hover:scale-105 shadow-md hover:shadow-lg font-bold"
          >
            <span>{t('cta')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border-2 border-border rounded-sm opacity-30 -rotate-12 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-24 h-24 border-2 border-border rounded-sm opacity-20 rotate-12 pointer-events-none" />
    </section>
  )
}
