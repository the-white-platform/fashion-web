import { NextResponse } from 'next/server'
import { indexNowKey } from '@/utilities/indexNow'

/**
 * IndexNow ownership proof. The protocol expects `/<key>.txt` to
 * echo the same key back as plain text — Next.js routes can't have
 * a literal `.txt` in the path segment, so we serve under
 * `/indexnow-<key>` and keep the extension in the ping payload's
 * keyLocation (`/indexnow-<key>.txt`). Both resolve to this route.
 */
export function GET(_req: Request, context: { params: Promise<{ key: string }> }) {
  return context.params.then(({ key }) => {
    const expected = indexNowKey()
    if (!expected) return NextResponse.json({ error: 'Not configured' }, { status: 404 })
    // Accept `<key>` and `<key>.txt` so both the short and
    // `.txt` variants resolve to the same verifier.
    const stripped = key.replace(/\.txt$/i, '')
    if (stripped !== expected) {
      return NextResponse.json({ error: 'Key mismatch' }, { status: 404 })
    }
    return new NextResponse(expected, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  })
}
