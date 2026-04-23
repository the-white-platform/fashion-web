import React from 'react'
import { Toaster } from 'sonner'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { CartProvider } from '@/contexts/CartContext'
import { UserProvider } from '@/contexts/UserContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext'
import { CompareProvider } from '@/contexts/CompareContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <CompareProvider>
                <ModalProvider>
                  <HeaderThemeProvider>{children}</HeaderThemeProvider>
                  {/* Mounted here (not in RootLayout) so every page
                      that calls `toast.success(...)` — copy buttons,
                      profile update, loyalty referral, etc — has a
                      renderer to land in. Before this, those calls
                      no-op'd silently. */}
                  <Toaster position="bottom-right" richColors closeButton />
                </ModalProvider>
              </CompareProvider>
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
