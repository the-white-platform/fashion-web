import ZaloSenderClient from '@/admin/ZaloSender/ZaloSenderClient'

interface Props {
  searchParams: Promise<{
    userId?: string
    preset?: string
    [key: string]: string | string[] | undefined
  }>
}

export default async function ZaloSenderPage({ searchParams }: Props) {
  const resolved = await searchParams
  const rawUser = resolved?.userId
  const rawPreset = resolved?.preset
  const initialUserId = Array.isArray(rawUser) ? rawUser[0] : rawUser
  const initialPreset = Array.isArray(rawPreset) ? rawPreset[0] : rawPreset

  return <ZaloSenderClient initialUserId={initialUserId} initialPreset={initialPreset} />
}
