import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { CartProvider } from '@/contexts/CartContext'
import { UserProvider } from '@/contexts/UserContext'
import { ModalProvider } from '@/contexts/ModalContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <ModalProvider>
            <HeaderThemeProvider>{children}</HeaderThemeProvider>
          </ModalProvider>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
