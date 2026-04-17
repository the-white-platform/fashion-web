import configPromise from '@payload-config'
import { getPayload } from 'payload'
import FAQPageClient from './page.client'

// Revalidate every 10 minutes — FAQ edits in Payload admin show up on
// the public page within this window without a deploy.
export const revalidate = 600

type FaqItem = {
  id: string
  question: string
  answer: string
  category: string
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const activeLocale = (locale === 'en' ? 'en' : 'vi') as 'vi' | 'en'

  let faqs: FaqItem[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'faqs',
      locale: activeLocale,
      where: { published: { equals: true } },
      sort: ['order', 'createdAt'],
      limit: 200,
      depth: 0,
    })

    faqs = docs.map((doc) => ({
      id: String(doc.id),
      question: doc.question,
      answer: doc.answer,
      category: (doc.category as string) ?? 'order',
    }))
  } catch (err) {
    // Swallow DB errors at build time / during initial deploy — the
    // client page renders an empty state rather than a 500.
    console.warn('Failed to load FAQs from Payload:', err)
  }

  return <FAQPageClient faqs={faqs} />
}
