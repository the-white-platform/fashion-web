import React from 'react'
import { getLocale } from 'next-intl/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Category } from '@/payload-types'
import { slugify } from '@/utilities/slugify'
import { FooterClient } from './Component.client'

export interface FooterCategoryLink {
  title: string
  slug: string
}

export async function Footer() {
  // Pull category labels straight from the DB (locale-aware) so the
  // footer column reflects what the admin actually has, instead of
  // five hardcoded keys that point everyone to /products with no
  // filter.
  let categories: FooterCategoryLink[] = []

  try {
    const locale = await getLocale()
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      locale: locale as 'vi' | 'en',
    })

    const counts = await Promise.all(
      (result?.docs ?? []).map(async (cat: Category) => {
        const { totalDocs } = await payload.count({
          collection: 'products',
          where: { category: { equals: cat.id } },
        })
        return { cat, count: totalDocs }
      }),
    )

    categories = counts
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(({ cat }) => ({ title: cat.title, slug: slugify(cat.title) }))
  } catch (err) {
    console.warn('Failed to load footer categories:', err)
  }

  return <FooterClient categories={categories} />
}
