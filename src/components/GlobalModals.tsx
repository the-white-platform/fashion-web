'use client'

import { SearchModal } from '@/components/ecommerce/SearchModal'
import { MobileMenu } from '@/Header/MobileMenu'
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
