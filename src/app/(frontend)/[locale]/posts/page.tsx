import type { Metadata } from 'next/types'

import { PostsLayout, PostsEmptyLayout } from '@/components/PostsLayout'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

// Revalidate every 10 minutes
export const revalidate = 600

export default async function Page() {
  try {
    const payload = await getPayload({ config: configPromise })

    const posts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      overrideAccess: false,
    })

    return (
      <>
        <PageClient />
        <PostsLayout posts={posts} />
      </>
    )
  } catch (error) {
    console.warn('Failed to fetch posts, returning empty page:', error)
    return (
      <>
        <PageClient />
        <PostsEmptyLayout />
      </>
    )
  }
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
