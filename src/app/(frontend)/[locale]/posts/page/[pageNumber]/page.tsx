import type { Metadata } from 'next/types'

import { PostsLayout, PostsEmptyLayout } from '@/components/PostsLayout'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import { isBuildMode } from '@/utilities/isBuildMode'

// Revalidate every 10 minutes
export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise

  const sanitizedPageNumber = Number(pageNumber)
  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  let postsObj: any = null

  try {
    const payload = await getPayload({ config: configPromise })
    postsObj = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      page: sanitizedPageNumber,
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

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  // Skip database queries during build time to avoid connection errors
  if (isBuildMode()) {
    return [{ pageNumber: '1' }]
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 10,
      draft: false,
      overrideAccess: false,
    })

    const pages: { pageNumber: string }[] = []

    for (let i = 1; i <= posts.totalPages; i++) {
      pages.push({ pageNumber: String(i) })
    }

    return pages
  } catch (error) {
    // During Docker build, database may not be available
    return [{ pageNumber: '1' }]
  }
}
