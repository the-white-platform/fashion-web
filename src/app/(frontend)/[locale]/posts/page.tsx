import type { Metadata } from 'next/types'

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

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
