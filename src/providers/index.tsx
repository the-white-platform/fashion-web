import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { CartProvider } from '@/contexts/CartContext'
import { UserProvider } from '@/contexts/UserContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { WishlistProvider } from '@/contexts/WishlistContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <ModalProvider>
              <HeaderThemeProvider>{children}</HeaderThemeProvider>
            </ModalProvider>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
