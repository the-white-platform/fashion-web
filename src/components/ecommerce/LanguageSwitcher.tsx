'use client'

import { useLocale } from 'next-intl'
import { Check, ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/routing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const changeLanguage = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale })
  }

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ]

  const currentLanguage = languages.find((l) => l.code === locale) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide hover:text-muted-foreground transition-colors bg-transparent border-none outline-none focus:outline-none">
        <span className="text-lg leading-none">{currentLanguage.flag}</span>
        <span className="hidden sm:inline-block">{currentLanguage.code}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] z-[100]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span className="text-lg leading-none">{lang.flag}</span>
            <span className="flex-1">{lang.label}</span>
            {locale === lang.code && <Check className="w-4 h-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
