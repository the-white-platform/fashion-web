import ZaloSenderClient from '@/admin/ZaloSender/ZaloSenderClient'

// Page reads `searchParams` — Next 16 treats that as dynamic and
// tries to static-render anyway on the default edge. Mirror the
// layout's force-dynamic so the render always gets a request
// context (same for every page under /management).
export const dynamic = 'force-dynamic'

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
