import type { Metadata } from 'next/types'
import { getTranslations } from 'next-intl/server'

import { PostsLayout, PostsEmptyLayout } from '@/components/PostsLayout'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

// Revalidate every 10 minutes
export const revalidate = 600

export default async function Page() {
  let postsObj: any = null

  try {
    const payload = await getPayload({ config: configPromise })

    postsObj = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      overrideAccess: false,
    })
  } catch (error) {
    console.warn('Failed to fetch posts, returning empty page:', error)
  }

  if (!postsObj) {
    return (
      <>
        <PageClient />
        <PostsEmptyLayout />
      </>
    )
  }

  return (
    <>
      <PageClient />
      <PostsLayout posts={postsObj} />
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = (rawLocale === 'en' ? 'en' : 'vi') as 'vi' | 'en'
  const t = await getTranslations({ locale, namespace: 'meta.posts' }).catch(() => null)
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'
  const path = '/posts'

  const title = t ? `${t('title')} | THE WHITE` : 'Blog | THE WHITE'
  const description = t
    ? t('description')
    : 'Cập nhật xu hướng, hướng dẫn phối đồ và câu chuyện thương hiệu từ THE WHITE.'

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: {
        'vi-VN': `${baseUrl}/vi${path}`,
        'en-US': `${baseUrl}/en${path}`,
        'x-default': `${baseUrl}/vi${path}`,
      },
    },
  }
}
