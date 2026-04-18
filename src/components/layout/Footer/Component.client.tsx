'use client'

import type { SVGProps } from 'react'
import { Facebook, Instagram, Phone, Mail } from 'lucide-react'
import { Link } from '@/i18n/Link'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/shared/Logo/Logo'
import { ZaloIcon } from '@/components/shared/icons/ZaloIcon'

// Shopee icon, outlined to match the lucide-react style used for the
// Facebook/Instagram icons next to it (fill="none", stroke="currentColor",
// 24×24 viewBox, 2px stroke, round caps/joins).
function ShopeeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Bag body */}
      <path d="M3 7h18l-1.1 13.1a2 2 0 0 1-2 1.9H6.1a2 2 0 0 1-2-1.9L3 7z" />
      {/* Handle arch */}
      <path d="M7.5 7V5.75a4.5 4.5 0 0 1 9 0V7" />
      {/* S curve inside the bag */}
      <path d="M14.5 11.4c-.9-.5-2.1-.7-3.1-.3-1 .5-1.1 1.8-.1 2.3l2.6 1.1c1 .4 1 1.8 0 2.3-1 .5-2.2.2-3.1-.3" />
    </svg>
  )
}

interface FooterClientProps {
  address?: string
  legalEntityName?: string
  taxCode?: string
  registrationAuthority?: string
  registrationDate?: string
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const yyyy = d.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function FooterClient({
  address = '',
  legalEntityName = '',
  taxCode = '',
  registrationAuthority = '',
  registrationDate = '',
}: FooterClientProps) {
  const t = useTranslations()
  const tContact = useTranslations('contact.info')
  const formattedDate = formatDate(registrationDate)

  return (
    <footer className="bg-background text-foreground py-12 lg:py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block bg-black text-white px-4 py-2 mb-4">
              <Logo showSlogan={false} className="items-start [&_img]:invert" />
            </Link>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {t('footer.aboutDesc')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/thewhiteactive/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all rounded-md border border-border"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/thewhite.cool"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all rounded-md border border-border"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://shopee.vn/thewhiteactive"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all rounded-md border border-border"
                aria-label="Shopee"
              >
                <ShopeeIcon className="w-5 h-5" />
              </a>
              <a
                href="https://zalo.me/3576162475657778031"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all rounded-md border border-border"
                aria-label="Zalo"
              >
                <ZaloIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide">
              {t('footer.customerService.title')}
            </h3>
            <ul className="space-y-2 text-muted-foreground font-normal">
              <li>
                <Link
                  href="/return-policy"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.customerService.returns')}
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.customerService.shipping')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.customerService.contact')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.customerService.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide">
              {t('nav.contact')}
            </h3>
            <ul className="space-y-3 text-muted-foreground font-normal">
              <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer text-sm">
                <Phone className="w-4 h-4" />
                <a href="tel:+84886402616">+84 886 402 616</a>
              </li>
              <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@thewhite.cool">contact@thewhite.cool</a>
              </li>
              <li className="pt-2">
                <p className="text-foreground text-sm font-semibold">{t('footer.contact.hours')}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal disclosure (Bộ Công Thương / tax authority) */}
        {(legalEntityName || taxCode || registrationAuthority || address) && (
          <div className="border-t border-border pt-6 pb-4 text-xs text-muted-foreground font-normal space-y-1">
            {legalEntityName && (
              <p className="text-foreground font-semibold uppercase tracking-wide">
                {legalEntityName}
              </p>
            )}
            {address && <p>{address}</p>}
            {taxCode && (
              <p>
                <span className="font-medium">{tContact('taxCodeLabel')}:</span> {taxCode}
              </p>
            )}
            {registrationAuthority && (
              <p>
                <span className="font-medium">{tContact('registrationLabel')}:</span>{' '}
                {registrationAuthority}
                {formattedDate && ` — ${tContact('issuedOn')} ${formattedDate}`}
              </p>
            )}
          </div>
        )}

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-sm text-center md:text-left font-normal">
            &copy; {new Date().getFullYear()} The White. {t('footer.rights')}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground font-normal">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms-of-use" className="hover:text-foreground transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
