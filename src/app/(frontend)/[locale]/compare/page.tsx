import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next/types'
import ComparePageClient from './page.client'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('compare')
  return {
    title: `${t('pageTitle')} | THE WHITE`,
  }
}

export default async function ComparePage() {
  return <ComparePageClient />
}
