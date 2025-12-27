'use client'

import { useTheme } from '@/providers/Theme'
import { Check, ChevronDown, Moon, Sun, Laptop } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('theme')

  const themes = [
    { code: 'light', label: t('light'), icon: Sun },
    { code: 'dark', label: t('dark'), icon: Moon },
    { code: 'system', label: t('system'), icon: Laptop },
  ]

  const currentTheme = themes.find((t) => t.code === (theme || 'system')) || themes[0]
  const Icon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide hover:text-muted-foreground transition-colors bg-transparent border-none outline-none focus:outline-none">
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline-block">{currentTheme.label}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] z-[100]">
        {themes.map((item) => {
          const ItemIcon = item.icon
          const isSelected = item.code === (theme || 'system')

          return (
            <DropdownMenuItem
              key={item.code}
              onClick={() =>
                setTheme(item.code === 'system' ? null : (item.code as 'light' | 'dark'))
              }
              className="flex items-center gap-3 cursor-pointer"
            >
              <ItemIcon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {isSelected && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
