'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/Link'
import { PageContainer } from '@/components/layout/PageContainer'
import { motion } from 'motion/react'
import { Search, Package, CreditCard, Truck, RefreshCw, HelpCircle, Box, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type FaqItem = {
  id: string
  question: string
  answer: string
  category: string
}

const CATEGORY_ICONS: Record<string, typeof HelpCircle> = {
  all: HelpCircle,
  order: Package,
  payment: CreditCard,
  shipping: Truck,
  return: RefreshCw,
  product: Box,
  account: User,
}

export default function FAQPageClient({ faqs }: { faqs: FaqItem[] }) {
  const t = useTranslations('faq')
  const tNav = useTranslations('nav')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Only surface categories that have at least one FAQ so the bar doesn't
  // show dead filters when admins delete rows from Payload.
  const availableCategoryIds = useMemo(() => {
    const present = new Set<string>()
    for (const f of faqs) present.add(f.category)
    return ['all', ...Array.from(present)]
  }, [faqs])

  const categories = availableCategoryIds.map((id) => ({
    id,
    label: t(`categories.${id}` as 'categories.all'),
    icon: CATEGORY_ICONS[id] ?? HelpCircle,
  }))

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <PageContainer>
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-8 font-medium">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{tNav('home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumb')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl uppercase tracking-tight mb-4 font-bold"
          >
            {t('title')}
          </motion.h1>
          <p className="text-muted-foreground font-medium text-lg">{t('subtitle')}</p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-12 py-6 text-base border-2 border-border rounded-sm focus:border-foreground transition-colors bg-background text-foreground"
            />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = selectedCategory === cat.id
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`uppercase tracking-wide rounded-sm px-6 py-3 font-bold text-sm transition-all ${
                    isActive ? '' : 'hover:border-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </Button>
              )
            })}
          </div>
        )}

        {/* FAQs */}
        <div className="space-y-3 mb-12">
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-2 border-border rounded-sm overflow-hidden hover:border-foreground transition-colors shadow-sm hover:shadow-md"
            >
              <Accordion type="single" collapsible>
                <AccordionItem value={faq.id} className="border-0">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-accent transition-colors">
                    <span className="text-left text-base font-bold pr-4 text-foreground">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 text-foreground leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-16 bg-muted rounded-sm">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-6 text-lg font-medium">{t('noResults')}</p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="rounded-sm border-2 border-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wide"
              >
                {t('clearFilter')}
              </Button>
            )}
          </div>
        )}

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-foreground text-background rounded-sm p-12 text-center shadow-2xl"
        >
          <h3 className="text-3xl lg:text-4xl uppercase tracking-tight mb-4 font-bold">
            {t('support.title')}
          </h3>
          <p className="opacity-80 mb-8 text-lg font-medium max-w-2xl mx-auto">
            {t('support.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border-2 border-background text-background hover:bg-background hover:text-foreground rounded-sm px-8 py-6 font-bold uppercase tracking-wide transition-colors h-12"
            >
              {tNav('contact')}
            </Link>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
