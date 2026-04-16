import { getCompanyInfo } from '@/utilities/getCompanyInfo'
import TermsOfUseClient from './page.client'

interface TermsOfUsePageProps {
  params: Promise<{ locale: string }>
}

export default async function TermsOfUsePage({ params }: TermsOfUsePageProps) {
  const { locale } = await params
  const companyInfo = await getCompanyInfo(locale)
  return <TermsOfUseClient companyInfo={companyInfo} />
}
