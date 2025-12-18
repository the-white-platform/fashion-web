import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { CartProvider } from '@/contexts/CartContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { UserProvider } from '@/contexts/UserContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <CartProvider>
            <HeaderThemeProvider>{children}</HeaderThemeProvider>
          </CartProvider>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
