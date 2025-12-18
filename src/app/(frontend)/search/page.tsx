import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Post } from '@/payload-types'
import { Search } from '@/search/Component'
import PageClient from './page.client'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
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
          <p className="text-gray-600 text-center py-12">Không tìm thấy kết quả cho "{query}"</p>
        </div>
      ) : null}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Tìm Kiếm - TheWhite`,
    description: 'Tìm kiếm sản phẩm thời trang thể thao',
  }
}
