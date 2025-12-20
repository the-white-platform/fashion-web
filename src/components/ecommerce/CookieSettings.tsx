'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface CookieSettingsProps {
  variant?: 'fab' | 'menu'
  onClose?: () => void
}

export function CookieSettings({ variant = 'fab', onClose }: CookieSettingsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('cookie-preferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

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
          className="fixed bottom-[74px] right-6 z-[90] bg-black text-white p-3 rounded-full shadow-xl hover:bg-white hover:text-black border-2 border-black transition-all group hidden lg:flex"
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
        />
      </>
    )
  }

  // Menu variant (for mobile menu)
  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-none w-full"
      >
        <div className="w-10 h-10 bg-black text-white border border-white/20 flex items-center justify-center shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
            Quyền riêng tư
          </p>
          <p className="font-bold uppercase tracking-tight">Cài đặt Cookie</p>
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
}

function CookieModal({
  isOpen,
  onClose,
  preferences,
  setPreferences,
  savePreferences,
  acceptAll,
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
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
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
              className="w-full max-w-md bg-black text-white shadow-2xl border border-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Cookie className="w-6 h-6" />
                  <h2 className="text-lg font-black uppercase tracking-tight">Cài đặt Cookie</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn. Bạn có thể chọn loại
                  cookie mà bạn cho phép.
                </p>

                {/* Cookie Options */}
                <div className="space-y-3">
                  {/* Necessary Cookies */}
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
                    <div>
                      <p className="font-bold text-sm uppercase tracking-tight">Cookie cần thiết</p>
                      <p className="text-xs text-gray-500 mt-1">Bắt buộc để website hoạt động</p>
                    </div>
                    <div className="w-12 h-6 bg-white/20 rounded-full relative cursor-not-allowed opacity-50">
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
                    <div>
                      <p className="font-bold text-sm uppercase tracking-tight">Cookie phân tích</p>
                      <p className="text-xs text-gray-500 mt-1">Giúp chúng tôi cải thiện website</p>
                    </div>
                    <button
                      onClick={() => setPreferences((p) => ({ ...p, analytics: !p.analytics }))}
                      className={`w-12 h-6 rounded-full relative transition-colors ${preferences.analytics ? 'bg-white' : 'bg-white/20'}`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${preferences.analytics ? 'right-0.5 bg-black' : 'left-0.5 bg-white'}`}
                      />
                    </button>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
                    <div>
                      <p className="font-bold text-sm uppercase tracking-tight">Cookie tiếp thị</p>
                      <p className="text-xs text-gray-500 mt-1">Cá nhân hóa quảng cáo cho bạn</p>
                    </div>
                    <button
                      onClick={() => setPreferences((p) => ({ ...p, marketing: !p.marketing }))}
                      className={`w-12 h-6 rounded-full relative transition-colors ${preferences.marketing ? 'bg-white' : 'bg-white/20'}`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${preferences.marketing ? 'right-0.5 bg-black' : 'left-0.5 bg-white'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-white/10">
                <button
                  onClick={savePreferences}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 font-bold uppercase text-sm tracking-tight transition-colors"
                >
                  Lưu tùy chọn
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 py-3 bg-white text-black hover:bg-gray-200 font-bold uppercase text-sm tracking-tight transition-colors"
                >
                  Chấp nhận tất cả
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
