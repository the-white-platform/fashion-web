import React from 'react'
import { getLocale } from 'next-intl/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { FooterClient } from './Component.client'

export async function Footer() {
  let address = ''
  let legalEntityName = ''
  let taxCode = ''
  let registrationAuthority = ''
  let registrationDate = ''

  try {
    const locale = await getLocale()
    const payload = await getPayload({ config: configPromise })
    const companyInfo = await payload.findGlobal({
      slug: 'company-info',
      locale: locale as 'vi' | 'en',
      depth: 0,
    })
    address = companyInfo?.address ?? ''
    legalEntityName = companyInfo?.legalEntityName ?? ''
    taxCode = companyInfo?.taxCode ?? ''
    registrationAuthority = companyInfo?.registrationAuthority ?? ''
    registrationDate = companyInfo?.registrationDate ?? ''
  } catch (err) {
    console.warn('Failed to load footer data:', err)
  }

  return (
    <FooterClient
      address={address}
      legalEntityName={legalEntityName}
      taxCode={taxCode}
      registrationAuthority={registrationAuthority}
      registrationDate={registrationDate}
    />
  )
}
