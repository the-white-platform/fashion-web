'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/Link'
import { motion } from 'motion/react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SmartSizePicker } from '@/components/ecommerce/SmartSizePicker'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const sizeCharts = {
  men: {
    shirt: [
      { size: 'XS', chest: '86-90', waist: '74-78', height: '160-165', weight: '50-55' },
      { size: 'S', chest: '90-94', waist: '78-82', height: '165-170', weight: '55-62' },
      { size: 'M', chest: '94-98', waist: '82-86', height: '170-175', weight: '62-70' },
      { size: 'L', chest: '98-102', waist: '86-90', height: '175-180', weight: '70-78' },
      { size: 'XL', chest: '102-106', waist: '90-94', height: '180-185', weight: '78-86' },
      { size: '2XL', chest: '106-112', waist: '94-100', height: '185-190', weight: '86-95' },
    ],
    pants: [
      { size: 'XS', waist: '74-78', hip: '86-90', length: '95-98', height: '160-165' },
      { size: 'S', waist: '78-82', hip: '90-94', length: '98-101', height: '165-170' },
      { size: 'M', waist: '82-86', hip: '94-98', length: '101-104', height: '170-175' },
      { size: 'L', waist: '86-90', hip: '98-102', length: '104-107', height: '175-180' },
      { size: 'XL', waist: '90-94', hip: '102-106', length: '107-110', height: '180-185' },
      { size: '2XL', waist: '94-100', hip: '106-112', length: '110-113', height: '185-190' },
    ],
  },
  women: {
    shirt: [
      { size: 'XS', chest: '80-84', waist: '60-64', height: '150-155', weight: '42-48' },
      { size: 'S', chest: '84-88', waist: '64-68', height: '155-160', weight: '48-54' },
      { size: 'M', chest: '88-92', waist: '68-72', height: '160-165', weight: '54-60' },
      { size: 'L', chest: '92-96', waist: '72-76', height: '165-170', weight: '60-67' },
      { size: 'XL', chest: '96-100', waist: '76-80', height: '170-175', weight: '67-74' },
      { size: '2XL', chest: '100-106', waist: '80-86', height: '175-180', weight: '74-82' },
    ],
    pants: [
      { size: 'XS', waist: '60-64', hip: '84-88', length: '90-93', height: '150-155' },
      { size: 'S', waist: '64-68', hip: '88-92', length: '93-96', height: '155-160' },
      { size: 'M', waist: '68-72', hip: '92-96', length: '96-99', height: '160-165' },
      { size: 'L', waist: '72-76', hip: '96-100', length: '99-102', height: '165-170' },
      { size: 'XL', waist: '76-80', hip: '100-104', length: '102-105', height: '170-175' },
      { size: '2XL', waist: '80-86', hip: '104-110', length: '105-108', height: '175-180' },
    ],
  },
}

export default function SizeGuidePage() {
  const t = useTranslations('sizeGuide')
  const tNav = useTranslations('nav')

  // Chart tab only — the AI calculator now lives in the shared
  // <SmartSizePicker /> component (also used as a modal on the
  // product detail page).
  const [gender, setGender] = useState<'men' | 'women'>('men')
  const [productType, setProductType] = useState<'shirt' | 'pants'>('shirt')

  const currentChart = sizeCharts[gender][productType]

  return (
    <PageContainer className="overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-8">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </motion.div>

        {/* AI Size Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <SmartSizePicker />
        </motion.div>

        {/* Size Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-muted rounded-sm p-8"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl uppercase tracking-wide">
              {gender === 'men' ? t('chart.title') : t('chart.womenTitle')}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setGender('men')}
                className={`px-4 py-2 rounded-sm border-2 transition-all uppercase tracking-wide text-sm ${
                  gender === 'men'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                {t('chart.gender.men')}
              </button>
              <button
                onClick={() => setGender('women')}
                className={`px-4 py-2 rounded-sm border-2 transition-all uppercase tracking-wide text-sm ${
                  gender === 'women'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:border-foreground'
                }`}
              >
                {t('chart.gender.women')}
              </button>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setProductType('shirt')}
              className={`px-4 py-2 rounded-sm border-2 transition-all uppercase tracking-wide text-sm ${
                productType === 'shirt'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              {t('chart.shirt')}
            </button>
            <button
              onClick={() => setProductType('pants')}
              className={`px-4 py-2 rounded-sm border-2 transition-all uppercase tracking-wide text-sm ${
                productType === 'pants'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              {t('chart.pants')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-foreground text-background">
                  <th className="border border-border px-4 py-3 text-left uppercase tracking-wide">
                    {t('chart.headers.size')}
                  </th>
                  {productType === 'shirt' ? (
                    <>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        {t('chart.headers.chest')}
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        {t('chart.headers.waist')}
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        {t('chart.headers.height')}
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        {t('chart.headers.weight')}
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        {t('chart.headers.waist')}
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        {t('chart.headers.hip')}
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        {t('chart.headers.inseam')}
                      </th>
                      <th className="border border-border px-4 py-3 uppercase tracking-wide">
                        {t('chart.headers.height')}
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentChart.map((row, index) => (
                  <tr key={row.size} className={index % 2 === 0 ? 'bg-muted/50' : 'bg-background'}>
                    <td className="border border-border px-4 py-3 font-bold">{row.size}</td>
                    {productType === 'shirt' ? (
                      <>
                        <td className="border border-border px-4 py-3 text-center">{row.chest}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.waist}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.height}</td>
                        <td className="border border-border px-4 py-3 text-center">
                          {'weight' in row ? row.weight : '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-border px-4 py-3 text-center">{row.waist}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.hip}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.length}</td>
                        <td className="border border-border px-4 py-3 text-center">{row.height}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-foreground text-background rounded-sm p-8"
        >
          <h3 className="text-2xl uppercase tracking-wide mb-6">{t('tips.title')}</h3>
          <div className="grid md:grid-cols-2 gap-6 opacity-80">
            {(['t1', 't2', 't3', 't4'] as const).map((key) => (
              <div key={key}>
                <p className="text-sm">• {t(`tips.${key}`)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
