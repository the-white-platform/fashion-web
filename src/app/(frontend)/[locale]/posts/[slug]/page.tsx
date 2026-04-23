import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/shared/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { isBuildMode } from '@/utilities/isBuildMode'
import PageClient from './page.client'

export async function generateStaticParams() {
  // Skip database queries during build time to avoid connection errors
  if (isBuildMode()) {
    return []
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
    })

    const params = posts.docs.map(({ slug }) => {
      return { slug }
    })

    return params
  } catch (error) {
    // During Docker build, database may not be available
    return []
  }
}

type Args = {
  params: Promise<{
    locale?: string
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { slug = '', locale = 'vi' } = await paramsPromise
  const url = '/posts/' + slug
  const post = await queryPostBySlug({ slug, locale: locale as 'vi' | 'en' })

  if (!post) return <PayloadRedirects url={url} />

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'
  const postUrl = `${baseUrl}/${locale}${url}`
  const metaImage = post.meta?.image
  const heroImage =
    typeof metaImage === 'object' && metaImage !== null && 'url' in metaImage && metaImage.url
      ? `${baseUrl}${metaImage.url}`
      : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta?.description || '',
    image: heroImage ? [heroImage] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'THE WHITE',
    },
    publisher: {
      '@type': 'Organization',
      name: 'THE WHITE',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo/thewhite-active.png` },
    },
    mainEntityOfPage: postUrl,
  }

  const blogLabel = locale === 'vi' ? 'Blog' : 'Blog'
  const homeLabel = locale === 'vi' ? 'Trang chủ' : 'Home'
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: homeLabel, item: `${baseUrl}/${locale}` },
      {
        '@type': 'ListItem',
        position: 2,
        name: blogLabel,
        item: `${baseUrl}/${locale}/posts`,
      },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  }

  return (
    <article className="pt-16 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container lg:mx-0 lg:grid lg:grid-cols-[1fr_48rem_1fr] grid-rows-[1fr]">
          <RichText
            className="lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[1fr]"
            content={post.content}
            enableGutter={false}
          />
        </div>

        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <RelatedPosts
            className="mt-12"
            docs={post.relatedPosts.filter((post) => typeof post === 'object')}
          />
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '', locale = 'vi' } = await paramsPromise
  const post = await queryPostBySlug({ slug, locale: locale as 'vi' | 'en' })

  return generateMeta({
    doc: post,
    locale: (locale === 'en' ? 'en' : 'vi') as 'vi' | 'en',
    path: `/posts/${slug}`,
  })
}

const queryPostBySlug = cache(async ({ slug, locale }: { slug: string; locale?: 'vi' | 'en' }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    ...(locale ? { locale } : {}),
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
