'use client'

import dynamic from 'next/dynamic'

const SearchModal = dynamic(
  () => import('@/components/ecommerce/SearchModal').then((mod) => mod.SearchModal),
  { ssr: false },
)
import { MobileMenu } from '@/components/layout/Header/MobileMenu'
import { useModal } from '@/contexts/ModalContext'
import { useUser } from '@/contexts/UserContext'
import type { Header } from '@/payload-types'

interface GlobalModalsProps {
  header: Header | null
}

export function GlobalModals({ header }: GlobalModalsProps) {
  const { isSearchOpen, setIsSearchOpen, isMobileMenuOpen, setIsMobileMenuOpen } = useModal()
  const { user } = useUser()

  return (
    <>
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        header={header}
        user={user}
      />
    </>
  )
}
