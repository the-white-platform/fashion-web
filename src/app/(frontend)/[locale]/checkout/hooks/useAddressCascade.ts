'use client'

import { useState, useEffect } from 'react'
import { AddressLocation } from '@/types/checkout'

interface AddressOption {
  id: string
  code: string
  name: string
}

interface UseAddressCascadeReturn {
  provinces: AddressOption[]
  districts: AddressOption[]
  wards: AddressOption[]
  selectedProvince: AddressLocation | null
  selectedDistrict: AddressLocation | null
  selectedWard: AddressLocation | null
  setProvince: (code: string) => void
  setDistrict: (code: string) => void
  setWard: (code: string) => void
  isLoading: boolean
}

export function useAddressCascade(): UseAddressCascadeReturn {
  const [provinces, setProvinces] = useState<AddressOption[]>([])
  const [districts, setDistricts] = useState<AddressOption[]>([])
  const [wards, setWards] = useState<AddressOption[]>([])

  const [selectedProvince, setSelectedProvince] = useState<AddressLocation | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<AddressLocation | null>(null)
  const [selectedWard, setSelectedWard] = useState<AddressLocation | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  // Fetch provinces on mount
  useEffect(() => {
    let cancelled = false
    fetch('/api/provinces?limit=100&sort=name')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProvinces(data?.docs ?? [])
      })
      .catch((err) => {
        console.error('Failed to fetch provinces:', err)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch districts when province changes
  useEffect(() => {
    let cancelled = false
    Promise.resolve()
      .then(() => {
        if (cancelled) return
        if (!selectedProvince) {
          setDistricts([])
          setSelectedDistrict(null)
          setWards([])
          setSelectedWard(null)
          return
        }
        setIsLoading(true)
        return fetch(
          `/api/districts?where[province][equals]=${selectedProvince.id}&limit=100&sort=name`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (!cancelled) {
              setDistricts(data?.docs ?? [])
              setSelectedDistrict(null)
              setWards([])
              setSelectedWard(null)
            }
          })
          .catch((err) => {
            console.error('Failed to fetch districts:', err)
          })
          .finally(() => {
            if (!cancelled) setIsLoading(false)
          })
      })
    return () => {
      cancelled = true
    }
  }, [selectedProvince])

  // Fetch wards when district changes
  useEffect(() => {
    let cancelled = false
    Promise.resolve()
      .then(() => {
        if (cancelled) return
        if (!selectedDistrict) {
          setWards([])
          setSelectedWard(null)
          return
        }
        setIsLoading(true)
        return fetch(
          `/api/wards?where[district][equals]=${selectedDistrict.id}&limit=100&sort=name`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (!cancelled) {
              setWards(data?.docs ?? [])
              setSelectedWard(null)
            }
          })
          .catch((err) => {
            console.error('Failed to fetch wards:', err)
          })
          .finally(() => {
            if (!cancelled) setIsLoading(false)
          })
      })
    return () => {
      cancelled = true
    }
  }, [selectedDistrict])

  const setProvince = (code: string) => {
    const province = provinces.find((p) => p.code === code)
    if (province) {
      setSelectedProvince({ id: province.id, name: province.name })
    } else {
      setSelectedProvince(null)
    }
  }

  const setDistrict = (code: string) => {
    const district = districts.find((d) => d.code === code)
    if (district) {
      setSelectedDistrict({ id: district.id, name: district.name })
    } else {
      setSelectedDistrict(null)
    }
  }

  const setWard = (code: string) => {
    const ward = wards.find((w) => w.code === code)
    if (ward) {
      setSelectedWard({ id: ward.id, name: ward.name })
    } else {
      setSelectedWard(null)
    }
  }

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setProvince,
    setDistrict,
    setWard,
    isLoading,
  }
}
