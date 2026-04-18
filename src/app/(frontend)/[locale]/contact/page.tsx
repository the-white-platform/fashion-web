import { getLocale } from 'next-intl/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import ContactPageClient from './ContactPageClient'

export default async function ContactPage() {
  let legalName = ''
  let address = ''

  try {
    const locale = await getLocale()
    const payload = await getPayload({ config: configPromise })
    const companyInfo = await payload.findGlobal({
      slug: 'company-info',
      locale: locale as 'vi' | 'en',
      depth: 0,
    })
    legalName = companyInfo?.companyName ?? ''
    address = companyInfo?.address ?? ''
  } catch (err) {
    console.warn('Failed to load contact page data:', err)
  }

  return <ContactPageClient legalName={legalName} address={address} />
}
