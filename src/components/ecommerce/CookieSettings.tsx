'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'

interface CookieSettingsProps {
  variant?: 'fab' | 'menu'
  onClose?: () => void
}

export function CookieSettings({ variant = 'fab', onClose }: CookieSettingsProps) {
  const t = useTranslations('cookieSettings')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cookie-preferences')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {}
      }
    }
    return {
      necessary: true,
      analytics: false,
      marketing: false,
    }
  })

  // Removed useEffect that set preferences on load to prevent cascaded render

  const savePreferences = () => {
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences))
    setIsModalOpen(false)
    onClose?.()
  }

  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true }
    setPreferences(allAccepted)
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted))
    setIsModalOpen(false)
    onClose?.()
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  // FAB Button variant (for desktop floating button)
  if (variant === 'fab') {
    return (
      <>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleOpenModal}
          className="fixed bottom-[74px] right-6 z-[90] bg-primary text-primary-foreground p-3 rounded-full shadow-xl hover:bg-background hover:text-foreground border-2 border-primary transition-all group hidden lg:flex"
          aria-label="Cookie Settings"
        >
          <Cookie className="w-4 h-4" />
        </motion.button>

        {/* Cookie Settings Modal */}
        <CookieModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          preferences={preferences}
          setPreferences={setPreferences}
          savePreferences={savePreferences}
          acceptAll={acceptAll}
          t={t}
        />
      </>
    )
  }

  // Menu variant (for mobile menu)
  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-all rounded-none w-full"
      >
        <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            {t('privacy')}
          </p>
          <p className="font-bold uppercase tracking-tight text-foreground">{t('title')}</p>
        </div>
      </button>

      {/* Cookie Settings Modal */}
      <CookieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preferences={preferences}
        setPreferences={setPreferences}
        savePreferences={savePreferences}
        acceptAll={acceptAll}
        t={t}
      />
    </>
  )
}

interface CookieModalProps {
  isOpen: boolean
  onClose: () => void
  preferences: { necessary: boolean; analytics: boolean; marketing: boolean }
  setPreferences: React.Dispatch<
    React.SetStateAction<{ necessary: boolean; analytics: boolean; marketing: boolean }>
  >
  savePreferences: () => void
  acceptAll: () => void
  t: ReturnType<typeof useTranslations<'cookieSettings'>>
}

function CookieModal({
  isOpen,
  onClose,
  preferences,
  setPreferences,
  savePreferences,
  acceptAll,
  t,
}: CookieModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200]"
          />

          {/* Modal Container - Flexbox Centering */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-card text-card-foreground shadow-2xl border border-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Cookie className="w-6 h-6" />
                  <h2 className="text-lg font-black uppercase tracking-tight">{t('title')}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors rounded-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{t('description')}</p>

                {/* Cookie Options */}
                <div className="space-y-3">
                  {/* Necessary Cookies */}
                  <div className="flex items-center justify-between p-4 bg-muted/20 border border-border">
                    <div className="pr-4">
                      <p className="font-bold text-sm uppercase tracking-tight text-foreground">
                        {t('necessary')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{t('necessaryDesc')}</p>
                    </div>
                    <Switch checked={true} disabled={true} />
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between p-4 bg-muted/20 border border-border">
                    <div className="pr-4">
                      <p className="font-bold text-sm uppercase tracking-tight text-foreground">
                        {t('analytics')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{t('analyticsDesc')}</p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences((p) => ({ ...p, analytics: checked }))
                      }
                    />
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between p-4 bg-muted/20 border border-border">
                    <div className="pr-4">
                      <p className="font-bold text-sm uppercase tracking-tight text-foreground">
                        {t('marketing')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{t('marketingDesc')}</p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={(checked) =>
                        setPreferences((p) => ({ ...p, marketing: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-border">
                <button
                  onClick={savePreferences}
                  className="flex-1 py-3 bg-muted hover:bg-muted/80 font-bold uppercase text-sm tracking-tight transition-colors text-foreground"
                >
                  {t('save')}
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase text-sm tracking-tight transition-colors"
                >
                  {t('acceptAll')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
