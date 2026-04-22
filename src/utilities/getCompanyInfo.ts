// Intentionally not `import 'server-only'` — Payload's
// `generate:types` evaluates the full config graph with tsx (no
// server-only resolver), so that import would break type gen.
// All callers hit `getPayload` which already requires a server
// context, so the client-safety guarantee is preserved de facto.
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { CompanyInfo } from '@/payload-types'

/**
 * Fetch the CompanyInfo global once per 10 minutes. Shared by public legal
 * pages (privacy, terms, etc.) so every consumer sees the same
 * admin-editable contact details.
 */
async function fetchCompanyInfo(locale?: string): Promise<CompanyInfo> {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({
    slug: 'company-info',
    locale: (locale as 'vi' | 'en') || 'vi',
    depth: 0,
  })
}

export const getCompanyInfo = (locale?: string) =>
  unstable_cache(() => fetchCompanyInfo(locale), ['company-info', locale || 'vi'], {
    tags: ['company-info'],
    revalidate: 600,
  })()
