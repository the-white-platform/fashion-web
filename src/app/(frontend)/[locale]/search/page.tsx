import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Post } from '@/payload-types'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { getTranslations } from 'next-intl/server'

type Args = {
  searchParams: Promise<{
    q: string
  }>
  params?: Promise<{ locale: string }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const t = await getTranslations('search')
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pb-24">
      <PageClient />
      <div className="container mx-auto px-6 mb-16">
        <div className="max-w-none">
          <h1 className="sr-only">Search</h1>
          <div className="mb-8">
            <Search />
          </div>
        </div>
      </div>

      {posts.totalDocs > 0 ? (
        <div className="container mx-auto px-6">
          <CollectionArchive posts={posts.docs as unknown as Post[]} />
        </div>
      ) : query ? (
        <div className="container mx-auto px-6">
          <p className="text-gray-600 text-center py-12">{t('noResults', { query })}</p>
        </div>
      ) : null}
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = params ? (await params).locale : 'vi'
  const t = await getTranslations({ locale, namespace: 'search' })
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}
