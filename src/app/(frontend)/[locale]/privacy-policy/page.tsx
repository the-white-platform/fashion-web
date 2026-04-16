import { getCompanyInfo } from '@/utilities/getCompanyInfo'
import PrivacyPolicyClient from './page.client'

interface PrivacyPolicyPageProps {
  params: Promise<{ locale: string }>
}

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
  const { locale } = await params
  const companyInfo = await getCompanyInfo(locale)
  return <PrivacyPolicyClient companyInfo={companyInfo} />
}
