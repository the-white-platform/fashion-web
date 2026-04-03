'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/useRouter'
import { Link } from '@/i18n/Link'
import {
  User,
  MapPin,
  CreditCard,
  Ruler,
  Sparkles,
  Package,
  LogOut,
  Pencil,
  Trash2,
  Star,
  Check,
  Award,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useUser } from '@/contexts/UserContext'
import { useTranslations } from 'next-intl'
import { PageContainer } from '@/components/layout/PageContainer'
import { toast } from 'sonner'

type Tab = 'profile' | 'size' | 'vto' | 'shipping' | 'payment' | 'orders'

interface LoyaltySummary {
  points: number
  tier: string
}

const TIER_LABELS: Record<string, string> = {
  bronze: 'Đồng',
  silver: 'Bạc',
  gold: 'Vàng',
  platinum: 'Bạch Kim',
}

const TIER_COLORS: Record<string, string> = {
  bronze: 'text-amber-700 bg-amber-100',
  silver: 'text-slate-500 bg-slate-100',
  gold: 'text-yellow-600 bg-yellow-50',
  platinum: 'text-purple-600 bg-purple-50',
}

export default function ProfilePage() {
  const router = useRouter()
  const {
    user,
    logout,
    updateProfile,
    updateShippingAddress,
    deleteShippingAddress,
    updatePaymentMethod,
    deletePaymentMethod,
  } = useUser()
  const t = useTranslations()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [orders, setOrders] = useState<any[]>([])
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch latest 5 orders for the orders tab
  useEffect(() => {
    if (!user) return
    fetch(`/api/orders?where[customerInfo.user][equals]=${user.id}&sort=-createdAt&limit=5`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.docs || []))
      .catch(() => {})
  }, [user])

  // Fetch loyalty summary
  useEffect(() => {
    if (!user) return
    fetch(`/api/loyalty-accounts?where[user][equals]=${user.id}&limit=1`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        const acc = data.docs?.[0]
        if (acc) setLoyalty({ points: acc.points ?? 0, tier: acc.tier ?? 'bronze' })
      })
      .catch(() => {})
  }, [user])

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
    <PageContainer>
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
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              {loyalty && (
                <Link
                  href="/loyalty"
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium uppercase tracking-wide transition-opacity hover:opacity-80 ${TIER_COLORS[loyalty.tier] ?? TIER_COLORS.bronze}`}
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {TIER_LABELS[loyalty.tier] ?? 'Đồng'} · {loyalty.points.toLocaleString('vi-VN')}{' '}
                    điểm
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 border-2 border-foreground text-foreground rounded-sm hover:bg-muted transition-colors uppercase tracking-wide w-full md:w-auto justify-center"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('profile.logout')}</span>
              </button>
            </div>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl uppercase tracking-wide">{t('profile.info')}</h2>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setEditName(user?.fullName ?? '')
                      setEditPhone(user?.phone ?? '')
                      setIsEditing(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm hover:bg-muted transition-colors text-sm uppercase tracking-wide"
                  >
                    <Pencil className="w-4 h-4" />
                    {t('common.edit') || 'Edit'}
                  </button>
                )}
              </div>
              {isEditing ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setIsSaving(true)
                    try {
                      await updateProfile({ name: editName, phone: editPhone })
                      toast.success(t('profile.updateSuccess') || 'Profile updated')
                      setIsEditing(false)
                    } catch {
                      toast.error(t('profile.updateError') || 'Failed to update profile')
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2 text-muted-foreground">
                      {t('checkout.fullName')}
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary transition-colors bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2 text-muted-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="w-full px-4 py-3 border-2 border-border rounded-sm bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    {user?.provider !== 'local' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('profile.emailReadOnly') ||
                          'Email cannot be changed for social login accounts'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2 text-muted-foreground">
                      {t('checkout.phone')}
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary transition-colors bg-background"
                      placeholder="0912345678"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-foreground text-background px-6 py-3 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wide disabled:opacity-50"
                    >
                      {isSaving
                        ? t('common.processing') || 'Saving...'
                        : t('common.save') || 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-border rounded-sm hover:bg-muted transition-colors uppercase tracking-wide"
                    >
                      {t('common.cancel') || 'Cancel'}
                    </button>
                  </div>
                </form>
              ) : (
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
                    <p className="text-foreground">
                      {user?.phone || t('profile.notUpdated') || 'Not updated'}
                    </p>
                  </div>
                </div>
              )}
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
                    <div key={address.id} className="border border-border rounded-sm p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{address.name}</p>
                          <p className="text-muted-foreground text-sm">{address.address}</p>
                          <p className="text-muted-foreground text-sm">
                            {address.ward?.name || address.ward},{' '}
                            {address.district?.name || address.district},{' '}
                            {address.province?.name || address.province}
                          </p>
                          <p className="text-muted-foreground text-sm">{address.phone}</p>
                        </div>
                        {address.isDefault && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-sm uppercase flex-shrink-0">
                            {t('profile.default') || 'Default'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                        {!address.isDefault && (
                          <button
                            onClick={() => {
                              updateShippingAddress(address.id, { isDefault: true })
                              toast.success(t('profile.defaultSet') || 'Default address set')
                            }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground uppercase tracking-wide"
                          >
                            <Star className="w-3 h-3" />
                            {t('profile.setDefault') || 'Set Default'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            deleteShippingAddress(address.id)
                            toast.success(t('profile.addressDeleted') || 'Address deleted')
                          }}
                          className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 uppercase tracking-wide"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t('common.delete') || 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t('profile.noAddresses') || 'No addresses yet. Add an address during checkout.'}
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
                    <div key={method.id} className="border border-border rounded-sm p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {method.type?.replace('_', ' ') || method.name}
                          </p>
                          {method.cardNumber && (
                            <p className="text-muted-foreground text-sm">
                              •••• {method.cardNumber.slice(-4)}
                            </p>
                          )}
                        </div>
                        {method.isDefault && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-sm uppercase flex-shrink-0">
                            {t('profile.default') || 'Default'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                        {!method.isDefault && (
                          <button
                            onClick={() => {
                              updatePaymentMethod(method.id, { isDefault: true })
                              toast.success(t('profile.defaultSet') || 'Default payment set')
                            }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground uppercase tracking-wide"
                          >
                            <Star className="w-3 h-3" />
                            {t('profile.setDefault') || 'Set Default'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            deletePaymentMethod(method.id)
                            toast.success(t('profile.paymentDeleted') || 'Payment method deleted')
                          }}
                          className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 uppercase tracking-wide"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t('common.delete') || 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t('profile.noPaymentMethods') ||
                    'No payment methods yet. Add a method during checkout.'}
                </p>
              )}
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="bg-card rounded-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl uppercase tracking-wide">{t('profile.orders')}</h2>
                {orders.length > 0 && (
                  <Link
                    href="/orders"
                    className="text-sm text-muted-foreground hover:text-foreground underline uppercase tracking-wide"
                  >
                    Xem tất cả
                  </Link>
                )}
              </div>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.orderNumber}`}
                      className="flex items-center justify-between p-4 border border-border rounded-sm hover:border-foreground transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} sản phẩm
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {(order.totals?.total || 0).toLocaleString('vi-VN')}₫
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
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
    </PageContainer>
  )
}
