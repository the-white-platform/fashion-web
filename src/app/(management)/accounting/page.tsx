import AccountingView from '@/admin/AccountingView'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    from?: string
    to?: string
    [key: string]: string | string[] | undefined
  }>
}

export default async function AccountingPage({ searchParams }: Props) {
  const resolved = await searchParams
  return <AccountingView searchParams={resolved} />
}
