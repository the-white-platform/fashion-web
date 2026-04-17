'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from 'next-intl'
import { AddressSelect } from './AddressSelect'

interface ShippingStepProps {
  user: any
  selectedAddress: any
  onSelectAddress: (address: any) => void
  showNewAddress: boolean
  onToggleNewAddress: () => void
  onNext: () => void
}

export function ShippingStep({
  user,
  selectedAddress,
  onSelectAddress,
  showNewAddress,
  onToggleNewAddress,
  onNext,
}: ShippingStepProps) {
  const t = useTranslations('checkout')
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    province: { id: '', name: '' },
    district: { id: '', name: '' },
    ward: { id: '', name: '' },
  })

  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('/api/provinces?limit=100&sort=name')
        const data = await res.json()
        setProvinces(data.docs || [])
      } catch (error) {
        console.error('Error fetching provinces:', error)
      }
    }
    fetchProvinces()
  }, [])

  const handleProvinceChange = async (provinceCode: string) => {
    const province = provinces.find((p) => String(p.code) === provinceCode)
    setNewAddress({
      ...newAddress,
      province: province ? { id: province.id, name: province.name } : { id: '', name: '' },
      district: { id: '', name: '' },
      ward: { id: '', name: '' },
    })
    setDistricts([])
    setWards([])

    if (provinceCode && province) {
      try {
        const res = await fetch(
          `/api/districts?where[province][equals]=${province.id}&limit=100&sort=name`,
        )
        const data = await res.json()
        setDistricts(data.docs || [])
      } catch (error) {
        console.error('Error fetching districts:', error)
      }
    }
  }

  const handleDistrictChange = async (districtCode: string) => {
    const district = districts.find((d) => String(d.code) === districtCode)
    setNewAddress({
      ...newAddress,
      district: district ? { id: district.id, name: district.name } : { id: '', name: '' },
      ward: { id: '', name: '' },
    })
    setWards([])

    if (districtCode && district) {
      try {
        const res = await fetch(
          `/api/wards?where[district][equals]=${district.id}&limit=100&sort=name`,
        )
        const data = await res.json()
        setWards(data.docs || [])
      } catch (error) {
        console.error('Error fetching wards:', error)
      }
    }
  }

  const handleWardChange = (wardCode: string) => {
    const ward = wards.find((w) => String(w.code) === wardCode)
    setNewAddress({
      ...newAddress,
      ward: ward ? { id: ward.id, name: ward.name } : { id: '', name: '' },
    })
  }

  const [saveAddress, setSaveAddress] = useState(false)
  const { addShippingAddress } = useUser()

  // Auto-fill name/phone from the logged-in user on first mount of the
  // new-address form, and only when those fields are still empty. Edits
  // the user makes after that are never overwritten — the effect keys
  // on `showNewAddress` (ran once when the form opens), and we check
  // emptiness before writing.
  useEffect(() => {
    if (!showNewAddress) return
    setNewAddress((prev) => {
      if (prev.name || prev.phone) return prev
      const autoName = user?.fullName ?? ''
      const autoPhone = user?.phone ?? ''
      if (!autoName && !autoPhone) return prev
      return { ...prev, name: prev.name || autoName, phone: prev.phone || autoPhone }
    })
  }, [showNewAddress, user?.fullName, user?.phone])

  // Preselect the default saved address on mount so the user isn't blocked
  // at "Tiếp Theo" until they manually click a radio.
  useEffect(() => {
    if (selectedAddress || showNewAddress) return
    const list = user?.shippingAddresses as any[] | undefined
    if (!list?.length) return
    const pick = list.find((a) => a.isDefault) ?? list[0]
    onSelectAddress(pick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.shippingAddresses?.length])

  const handleNext = () => {
    if (!selectedAddress && !showNewAddress) {
      alert(t('addressInfo'))
      return
    }
    // Saved addresses predating the current required-field set can be missing
    // name/phone/address/district — selecting one would POST null and trip
    // Payload's 400. Require shipping identity (name + phone + street + district).
    if (selectedAddress && !showNewAddress) {
      const savedDistrictId =
        typeof selectedAddress.district === 'object'
          ? selectedAddress.district?.id
          : selectedAddress.district
      if (
        !selectedAddress.name ||
        !selectedAddress.phone ||
        !selectedAddress.address ||
        !savedDistrictId
      ) {
        alert(t('addressInfo'))
        return
      }
    }
    if (showNewAddress) {
      if (
        !newAddress.name ||
        !newAddress.phone ||
        !newAddress.address ||
        !newAddress.province.id ||
        !newAddress.district.id
      ) {
        alert(t('addressInfo'))
        return
      }
      onSelectAddress(newAddress)
      if (saveAddress) {
        addShippingAddress({
          name: newAddress.name,
          phone: newAddress.phone,
          address: newAddress.address,
          province: newAddress.province,
          district: newAddress.district,
          ward: newAddress.ward,
          isDefault: user?.shippingAddresses?.length === 0,
        })
      }
    }
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-card border border-border rounded-sm p-8"
    >
      <h2 className="text-2xl uppercase tracking-wide mb-6">{t('shipping')}</h2>

      {/* Saved Addresses — one RadioGroup across the list (not one per item)
          so the group manages `value` / onValueChange and the label-for-id
          click target actually toggles the selection. Previously each card
          wrapped a single RadioGroupItem with no `value` on the group, which
          is why clicking the card did nothing.

          City/district/ward come back as relationship objects when the user
          is fetched with depth≥1, so we extract the `.name` field to avoid
          "[object Object]" appearing in the address line. */}
      {user?.shippingAddresses && user.shippingAddresses.length > 0 && !showNewAddress && (
        <RadioGroup
          value={(() => {
            const idx = user.shippingAddresses.indexOf(selectedAddress)
            return idx >= 0 ? String(idx) : ''
          })()}
          onValueChange={(val) => {
            const idx = Number(val)
            onSelectAddress(user.shippingAddresses[idx] ?? null)
          }}
          className="space-y-4 mb-6"
        >
          {user.shippingAddresses.map((address: any, index: number) => {
            const addressId = `saved-address-${index}`
            // UserContext.mapPayloadUser renames Payload's `city` field to
            // `province` and exposes each as { id, name }. We also fall
            // through to the raw `city` field in case some code path bypasses
            // the mapper and passes the unnormalized Payload shape.
            const nameOf = (v: unknown): string =>
              typeof v === 'object' && v !== null
                ? ((v as { name?: string }).name ?? '')
                : typeof v === 'string'
                  ? v
                  : ''
            const ward = nameOf(address.ward)
            const district = nameOf(address.district)
            const province = nameOf(address.province ?? address.city)
            return (
              <Label
                key={index}
                htmlFor={addressId}
                className={`block p-4 border-2 rounded-sm cursor-pointer transition-all ${
                  selectedAddress === address
                    ? 'border-foreground bg-background'
                    : 'border-border hover:border-foreground'
                }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={String(index)} id={addressId} />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{address.name}</p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.address}
                      {ward && `, ${ward}`}
                      {district && `, ${district}`}
                      {province && `, ${province}`}
                    </p>
                    {address.isDefault && (
                      <Badge variant="secondary" className="mt-2">
                        {t('default')}
                      </Badge>
                    )}
                  </div>
                </div>
              </Label>
            )
          })}
        </RadioGroup>
      )}

      {/* New Address Form */}
      {showNewAddress && (
        <div className="space-y-4 mb-6">
          <div>
            <Label>{t('fullName')} *</Label>
            <Input
              value={newAddress.name}
              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
              onClear={() => setNewAddress({ ...newAddress, name: '' })}
              placeholder={t('namePlaceholder')}
              required
            />
          </div>
          <div>
            <Label>{t('phone')} *</Label>
            <Input
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              onClear={() => setNewAddress({ ...newAddress, phone: '' })}
              placeholder={t('phonePlaceholder')}
              required
            />
          </div>
          <div>
            <Label>{t('address')} *</Label>
            <Input
              value={newAddress.address}
              onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              onClear={() => setNewAddress({ ...newAddress, address: '' })}
              placeholder={t('addressPlaceholder')}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('city')} *</Label>
              <AddressSelect
                options={provinces.map((p) => ({ label: p.name, value: String(p.code) }))}
                value={provinces.find((p) => p.id === newAddress.province.id)?.code}
                onChange={handleProvinceChange}
                placeholder={t('selectCity')}
                emptyText={t('noCityFound')}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('district')} *</Label>
              <AddressSelect
                options={districts.map((d) => ({ label: d.name, value: String(d.code) }))}
                value={districts.find((d) => d.id === newAddress.district.id)?.code}
                onChange={handleDistrictChange}
                placeholder={t('selectDistrict')}
                emptyText={t('noDistrictFound')}
                disabled={!newAddress.province.id}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('ward')} *</Label>
              <AddressSelect
                options={wards.map((w) => ({ label: w.name, value: String(w.code) }))}
                value={wards.find((w) => w.id === newAddress.ward.id)?.code}
                onChange={handleWardChange}
                placeholder={t('selectWard')}
                emptyText={t('noWardFound')}
                disabled={!newAddress.district.id}
              />
            </div>
          </div>

          <div className="flex items-start space-x-2 mt-4">
            <Checkbox
              id="save-address"
              checked={saveAddress}
              onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
              className="mt-0.5"
            />
            <label
              htmlFor="save-address"
              className="text-sm font-medium leading-snug cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('saveAddress')}
              {!user && (
                <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                  {t('saveAddressGuestHint')}
                </span>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Toggle New Address */}
      {user?.shippingAddresses && user.shippingAddresses.length > 0 && (
        <Button variant="ghost" onClick={onToggleNewAddress} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          {showNewAddress ? t('useSavedAddress') : t('addNewAddress')}
        </Button>
      )}

      {/* Action Button */}
      <Button onClick={handleNext} className="w-full" size="lg">
        {t('next')}
      </Button>
    </motion.div>
  )
}
