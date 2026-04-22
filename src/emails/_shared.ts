import type { CompanyInfo } from '@/payload-types'

// Shared branding bits for all transactional emails. Keeps the
// logo, company block, and link colour consistent without each
// template rolling its own inline HTML. Values come from the
// `company-info` Payload global so marketing can edit the
// registered address / hotline / tax code without a deploy.

export type BrandContext = {
  locale: 'vi' | 'en'
  serverUrl: string
  company: CompanyInfo | null
}

export function resolveServerUrl(): string {
  // `NEXT_PUBLIC_SERVER_URL` is set in every env (.env.example).
  // Fallback is the live domain so an accidental empty var still
  // produces a reachable logo URL instead of a broken image.
  return process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'
}

/**
 * Dark header with the brand mark. The combined logo image
 * (`public/logo/thewhite-active.png`) already bakes the W glyph
 * plus "THE WHITE / TAKE ACTION" wordmark, so the header renders
 * as a single centred `<img>` on a black background. PNG for
 * broad email-client compatibility (Outlook chokes on SVG).
 */
export function brandHeader(serverUrl: string): string {
  const logoUrl = `${serverUrl}/logo/thewhite-active.png`
  return `
    <tr>
      <td style="background:#000;padding:28px 40px;text-align:center;">
        <img
          src="${logoUrl}"
          alt="THE WHITE ACTIVE"
          width="120"
          style="display:block;margin:0 auto;border:0;max-width:120px;height:auto;"
        />
      </td>
    </tr>
  `.trim()
}

/**
 * Footer with support email + legal entity block. Falls back to
 * the canonical support address when the CompanyInfo global isn't
 * populated, so emails still render on a fresh DB.
 */
export function brandFooter({ locale, company }: BrandContext): string {
  const isVi = locale === 'vi'
  const supportEmail = company?.email || 'support@thewhite.cool'
  const phone = company?.phone
  const address = company?.address
  const companyName = company?.companyName || 'THE WHITE ACTIVE'
  const website = company?.websiteUrl || 'thewhite.cool'
  const websiteUrl = website.startsWith('http') ? website : `https://${website}`

  const supportLine = isVi
    ? `Cần hỗ trợ? Liên hệ <a href="mailto:${supportEmail}" style="color:#1a1a1a;">${supportEmail}</a>.`
    : `Need help? Contact <a href="mailto:${supportEmail}" style="color:#1a1a1a;">${supportEmail}</a>.`

  const phoneLine = phone
    ? isVi
      ? `Hotline: <a href="tel:${phone}" style="color:#1a1a1a;">${phone}</a>`
      : `Hotline: <a href="tel:${phone}" style="color:#1a1a1a;">${phone}</a>`
    : ''

  return `
    <tr>
      <td style="padding:24px 40px 32px;text-align:center;border-top:1px solid #eee;color:#666;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;">
        <p style="margin:0 0 8px;">${supportLine}</p>
        ${phoneLine ? `<p style="margin:0 0 12px;">${phoneLine}</p>` : ''}
        <p style="margin:16px 0 4px;font-weight:600;color:#333;">${escape(companyName)}</p>
        ${address ? `<p style="margin:0 0 4px;white-space:pre-line;">${escape(address)}</p>` : ''}
        <p style="margin:0 0 4px;">
          <a href="${websiteUrl}" style="color:#666;text-decoration:none;">${escape(website)}</a>
        </p>
        <p style="margin:12px 0 0;font-size:11px;color:#aaa;">
          © ${new Date().getFullYear()} THE WHITE ACTIVE
        </p>
      </td>
    </tr>
  `.trim()
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
