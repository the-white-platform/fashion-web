'use client'

import { Facebook, Instagram, Youtube, Phone, Mail } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/Logo/Logo'

export function FooterClient() {
  const t = useTranslations()

  return (
    <footer className="bg-background text-foreground py-12 lg:py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block bg-black text-white px-4 py-2 mb-4">
              <Logo showSlogan={false} className="items-start" />
            </Link>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {t('footer.aboutDesc')}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-background text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all rounded-md border border-border"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-background text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all rounded-md border border-border"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-background text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all rounded-md border border-border"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide">
              {t('nav.products')}
            </h3>
            <ul className="space-y-2 text-muted-foreground font-normal">
              <li>
                <Link
                  href="/products"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.products.shirts')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.products.pants')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.products.shoes')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.products.accessories')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.products.new')}
                </Link>
              </li>
            </ul>
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
                  href="/size-guide"
                  className="hover:text-foreground transition-colors text-left text-sm block"
                >
                  {t('footer.customerService.sizeGuide')}
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
                <a href="tel:+84123456789">0123 456 789</a>
              </li>
              <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@thewhite.vn">support@thewhite.vn</a>
              </li>
              <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer text-sm">
                <Instagram className="w-4 h-4" />
                <a
                  href="https://instagram.com/thewhite.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @thewhite.vn
                </a>
              </li>
              <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer text-sm">
                <Phone className="w-4 h-4" />
                <a href="https://zalo.me/0123456789" target="_blank" rel="noopener noreferrer">
                  Zalo: 0123456789
                </a>
              </li>
              <li className="pt-2">
                <p className="text-foreground text-sm font-semibold">{t('footer.contact.hours')}</p>
                <p className="text-muted-foreground mt-1 text-sm">{t('footer.contact.showroom')}</p>
              </li>
            </ul>
          </div>
        </div>

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
