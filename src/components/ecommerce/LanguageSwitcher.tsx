'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <button
        onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
        className="text-sm uppercase tracking-wide hover:text-gray-400 transition-colors"
      >
        {language === 'vi' ? 'EN' : 'VI'}
      </button>
    </div>
  )
}
