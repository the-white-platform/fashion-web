/**
 * IndexNow — push URL changes to Bing / Yandex so they crawl
 * within minutes instead of waiting for their own scheduler.
 * Google currently ignores the protocol but participates through
 * its own mechanisms (sitemap + GSC), so this is a net positive
 * across the search-engine spread.
 *
 * Key handling: set `INDEXNOW_KEY` in the environment (any
 * 8–128 char alphanumeric string); the `/indexnow-<KEY>.txt`
 * route echoes the same value so the protocol's ownership proof
 * resolves.
 *
 * This module is best-effort: failures are logged and swallowed —
 * never blocks a Payload save.
 */

const HOST = (() => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'
  try {
    return new URL(url).host
  } catch {
    return 'thewhite.cool'
  }
})()

export function indexNowKey(): string | null {
  const k = process.env.INDEXNOW_KEY?.trim()
  return k && /^[A-Za-z0-9]{8,128}$/.test(k) ? k : null
}

export async function pingIndexNow(urls: string[]): Promise<boolean> {
  const key = indexNowKey()
  if (!key) {
    console.info('[indexNow] Skip — INDEXNOW_KEY not configured')
    return false
  }
  const list = urls.filter((u) => typeof u === 'string' && u.length > 0)
  if (list.length === 0) return false

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `https://${HOST}/indexnow-${key}.txt`,
        urlList: list,
      }),
    })
    if (!res.ok) {
      console.warn(`[indexNow] HTTP ${res.status} for ${list.length} url(s)`)
      return false
    }
    console.info(`[indexNow] Pinged ${list.length} url(s)`)
    return true
  } catch (err) {
    console.warn(`[indexNow] Failed: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
}
