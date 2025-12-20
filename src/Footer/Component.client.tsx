'use client'

import { Facebook, Instagram, Youtube, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { Logo } from '@/components/Logo/Logo'

export function FooterClient() {
  const { t } = useLanguage()

  return (
    <footer className="bg-white text-black py-12 lg:py-16 border-t border-gray-300">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block bg-black px-4 py-2 mb-4">
              <Logo showSlogan={false} className="items-start" />
            </Link>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">{t('footer.aboutDesc')}</p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-all rounded-md border border-gray-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-all rounded-md border border-gray-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-all rounded-md border border-gray-300"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide">Sản Phẩm</h3>
            <ul className="space-y-2 text-gray-600 font-normal">
              <li>
                <Link
                  href="/products"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.products.shirts')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.products.pants')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.products.shoes')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.products.accessories')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.products.new')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide">
              {t('footer.customer')}
            </h3>
            <ul className="space-y-2 text-gray-600 font-normal">
              <li>
                <Link
                  href="/return-policy"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.support.return')}
                </Link>
              </li>
              <li>
                <Link
                  href="/shopping-guide"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.support.guide')}
                </Link>
              </li>
              <li>
                <Link
                  href="/payment-shipping"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.support.payment')}
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.support.size')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-black transition-colors text-left text-sm block"
                >
                  {t('footer.support.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide">
              {t('nav.contact')}
            </h3>
            <ul className="space-y-3 text-gray-600 font-normal">
              <li className="flex items-center gap-2 hover:text-black transition-colors cursor-pointer text-sm">
                <Phone className="w-4 h-4" />
                <a href="tel:+84123456789">0123 456 789</a>
              </li>
              <li className="flex items-center gap-2 hover:text-black transition-colors cursor-pointer text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@thewhite.vn">support@thewhite.vn</a>
              </li>
              <li className="flex items-center gap-2 hover:text-black transition-colors cursor-pointer text-sm">
                <Instagram className="w-4 h-4" />
                <a
                  href="https://instagram.com/thewhite.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @thewhite.vn
                </a>
              </li>
              <li className="flex items-center gap-2 hover:text-black transition-colors cursor-pointer text-sm">
                <Phone className="w-4 h-4" />
                <a href="https://zalo.me/0123456789" target="_blank" rel="noopener noreferrer">
                  Zalo: 0123456789
                </a>
              </li>
              <li className="pt-2">
                <p className="text-gray-700 text-sm font-semibold">{t('footer.contact.hours')}</p>
                <p className="text-gray-600 mt-1 text-sm">{t('footer.contact.showroom')}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm text-center md:text-left font-normal">
            {t('footer.copyright')}
          </div>
          <div className="flex gap-6 text-sm text-gray-600 font-normal">
            <Link href="/privacy-policy" className="hover:text-black transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms-of-use" className="hover:text-black transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
