'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  CreditCard,
  Truck,
  Shield,
  Clock,
  MapPin,
  Package,
  DollarSign,
  Smartphone,
} from 'lucide-react'
import { Link } from '@/i18n/Link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function PaymentShippingPage() {
  const t = useTranslations('paymentShipping')
  const tNav = useTranslations('nav')

  return (
    <PageContainer className="overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{tNav('home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumb')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </motion.div>

        {/* Payment Section */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-foreground text-background border-2 border-foreground rounded-sm p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-8 h-8" />
                <h2 className="text-3xl uppercase tracking-wide">{t('payment.title')}</h2>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* COD */}
              <div className="bg-card border-2 border-border rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">{t('payment.cod.name')}</h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <p>• {t('payment.cod.desc')}</p>
                  <p>• {t('payment.cod.note')}</p>
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="bg-card border-2 border-border rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">{t('payment.bank.name')}</h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <p>• {t('payment.bank.desc')}</p>
                  <p>• {t('payment.bank.note')}</p>
                </div>
              </div>

              {/* Credit/Debit Card */}
              <div className="bg-card border-2 border-border rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">{t('payment.card.name')}</h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <p>• {t('payment.card.desc')}</p>
                  <p>• {t('payment.card.note')}</p>
                </div>
              </div>

              {/* E-Wallets */}
              <div className="bg-card border-2 border-border rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">{t('payment.wallet.name')}</h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <p>• {t('payment.wallet.desc')}</p>
                  <p>• {t('payment.wallet.note')}</p>
                </div>
              </div>

              {/* Installment */}
              <div className="bg-muted border-2 border-border rounded-sm p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6" />
                  <h3 className="text-xl uppercase tracking-wide">
                    {t('payment.installment.name')}
                  </h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <p>• {t('payment.installment.desc')}</p>
                  <p>• {t('payment.installment.note')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-foreground text-background border-2 border-foreground rounded-sm p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-8 h-8" />
                <h2 className="text-3xl uppercase tracking-wide">{t('shipping.title')}</h2>
              </div>
            </div>

            {/* Shipping Options */}
            <div className="space-y-6">
              {/* Standard Shipping */}
              <div className="bg-card border-2 border-border rounded-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-sm flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl uppercase tracking-wide mb-3">
                      {t('shipping.standard.name')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{t('shipping.standard.time')}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>{t('shipping.standard.fee')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Shipping */}
              <div className="bg-card border-2 border-border rounded-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl uppercase tracking-wide mb-3">
                      {t('shipping.fast.name')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{t('shipping.fast.time')}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>{t('shipping.fast.fee')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Express Shipping */}
              <div className="bg-card border-2 border-foreground rounded-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl uppercase tracking-wide mb-3">
                      {t('shipping.express.name')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{t('shipping.express.time')}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>{t('shipping.express.fee')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Pickup */}
              <div className="bg-muted border-2 border-border rounded-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-border rounded-sm flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl uppercase tracking-wide mb-3">
                      {t('shipping.pickup.name')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{t('shipping.pickup.time')}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{t('shipping.pickup.fee')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery Partners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border-2 border-border rounded-sm p-8"
          >
            <h3 className="text-2xl uppercase tracking-wide mb-6 text-center">
              {t('partners.title')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-muted rounded-sm">
                <p className="uppercase tracking-wide text-sm">Giao Hàng Nhanh</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-sm">
                <p className="uppercase tracking-wide text-sm">Giao Hàng Tiết Kiệm</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-sm">
                <p className="uppercase tracking-wide text-sm">J&T Express</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-sm">
                <p className="uppercase tracking-wide text-sm">Viettel Post</p>
              </div>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-foreground text-background border-2 border-foreground rounded-sm p-8 text-center"
          >
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl uppercase tracking-wide mb-4">{t('security.title')}</h3>
            <p className="opacity-80 max-w-2xl mx-auto mb-6">{t('security.desc')}</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="px-4 py-2 bg-background/10 rounded-sm">SSL 256-bit</div>
              <div className="px-4 py-2 bg-background/10 rounded-sm">PCI-DSS Certified</div>
              <div className="px-4 py-2 bg-background/10 rounded-sm">3D Secure</div>
              <div className="px-4 py-2 bg-background/10 rounded-sm">Verified by Visa</div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  )
}
