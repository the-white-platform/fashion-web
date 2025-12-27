'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { Link } from '@/i18n/routing'
import { User, MapPin, CreditCard, Ruler, Sparkles, Package, LogOut } from 'lucide-react'
import { motion } from 'motion/react'
import { useUser } from '@/contexts/UserContext'
import { useTranslations } from 'next-intl'

type Tab = 'profile' | 'size' | 'vto' | 'shipping' | 'payment' | 'orders'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useUser()
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const tabs = [
    { id: 'profile' as Tab, label: t('profile.info'), icon: User },
    { id: 'size' as Tab, label: t('profile.size'), icon: Ruler },
    { id: 'vto' as Tab, label: t('profile.vto'), icon: Sparkles },
    { id: 'shipping' as Tab, label: t('profile.addresses'), icon: MapPin },
    { id: 'payment' as Tab, label: t('profile.payment'), icon: CreditCard },
    { id: 'orders' as Tab, label: t('profile.orders'), icon: Package },
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen pt-32 bg-background pb-12">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-sm border border-border p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-sm flex items-center justify-center text-2xl uppercase">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl uppercase tracking-wide">{user.fullName}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 border-2 border-foreground text-foreground rounded-sm hover:bg-muted transition-colors uppercase tracking-wide w-full md:w-auto justify-center"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('profile.logout')}</span>
            </button>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card rounded-sm border border-border mb-6 shadow-sm"
        >
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      setActiveTab(tab.id)
                      e.currentTarget.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center',
                      })
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-4 md:px-6 md:py-5 md:gap-3 transition-colors relative whitespace-nowrap flex-shrink-0 ${
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'stroke-2' : 'stroke-1.5'}`}
                    />
                    <span
                      className={`uppercase tracking-wide text-xs md:text-sm ${isActive ? 'font-bold' : 'font-medium'}`}
                    >
                      {tab.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && (
            <div className="bg-card rounded-sm border border-border p-6 md:p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('profile.info')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm uppercase tracking-wide mb-2 text-muted-foreground">
                    {t('checkout.fullName')}
                  </label>
                  <p className="text-foreground">{user?.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wide mb-2 text-muted-foreground">
                    Email
                  </label>
                  <p className="text-foreground">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wide mb-2 text-muted-foreground">
                    {t('checkout.phone')}
                  </label>
                  <p className="text-foreground">{user?.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'size' && (
            <div className="bg-card rounded-sm border border-border p-6 md:p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('profile.size')}</h2>
              <p className="text-muted-foreground">
                Tính năng này sẽ được triển khai sớm. Sử dụng{' '}
                <Link href="/size-guide" className="text-foreground underline">
                  Hướng Dẫn Chọn Size
                </Link>{' '}
                để tìm size phù hợp.
              </p>
            </div>
          )}
          {activeTab === 'vto' && (
            <div className="bg-card rounded-sm border border-border p-6 md:p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('profile.vto')}</h2>
              <p className="text-muted-foreground">
                Tính năng Virtual Try-On sẽ được triển khai sớm. Tính năng này cho phép bạn thử đồ
                ảo bằng công nghệ AI.
              </p>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="bg-card rounded-sm border border-border p-6 md:p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('profile.addresses')}</h2>
              {user?.shippingAddresses && user.shippingAddresses.length > 0 ? (
                <div className="space-y-4">
                  {user.shippingAddresses.map((address: any) => (
                    <div
                      key={address.id}
                      className="border border-border rounded-sm p-4 flex items-start justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">{address.name}</p>
                        <p className="text-muted-foreground text-sm">{address.address}</p>
                        <p className="text-muted-foreground text-sm">
                          {address.ward}, {address.district}, {address.city}
                        </p>
                        <p className="text-muted-foreground text-sm">{address.phone}</p>
                      </div>
                      {address.isDefault && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-sm uppercase">
                          Mặc định
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Chưa có địa chỉ nào. Thêm địa chỉ khi thanh toán.
                </p>
              )}
            </div>
          )}
          {activeTab === 'payment' && (
            <div className="bg-card rounded-sm border border-border p-6 md:p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('profile.payment')}</h2>
              {user?.paymentMethods && user.paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {user.paymentMethods.map((method: any) => (
                    <div
                      key={method.id}
                      className="border border-border rounded-sm p-4 flex items-start justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">{method.name}</p>
                        <p className="text-muted-foreground text-sm">{method.details}</p>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-sm uppercase">
                          Mặc định
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Chưa có phương thức thanh toán nào. Thêm phương thức khi thanh toán.
                </p>
              )}
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="bg-card rounded-sm border border-border p-6 md:p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('profile.orders')}</h2>
              {user?.orderHistory && user.orderHistory.length > 0 ? (
                <div className="space-y-4">
                  {user.orderHistory
                    .slice()
                    .reverse()
                    .map((order: any) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block border border-border rounded-sm p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Đơn hàng #{order.id}</p>
                            <p className="text-muted-foreground text-sm">
                              {new Date(order.date).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              {order.total.toLocaleString('vi-VN')}₫
                            </p>
                            <p className="text-muted-foreground text-sm capitalize">
                              {order.status}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào</p>
                  <Link
                    href="/products"
                    className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-sm hover:bg-primary/90 transition-colors uppercase tracking-wide"
                  >
                    Khám Phá Sản Phẩm
                  </Link>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
