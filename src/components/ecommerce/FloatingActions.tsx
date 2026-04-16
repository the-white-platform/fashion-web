'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import dynamic from 'next/dynamic'
import { ScrollToTop } from './ScrollToTop'
import { CookieSettings } from './CookieSettings'

const WolfiesChatbot = dynamic(() => import('./WolfiesChatbot').then((mod) => mod.WolfiesChatbot), {
  ssr: false,
})

export function FloatingActions() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      {/* Wolfies chat toggle — hidden while the modal is open so the
          modal's close button doesn't overlap. Re-enabled now that the
          route injects a CMS-editable context pack (brand + size guide
          + catalog) so answers are grounded. */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 z-[100] bg-primary text-primary-foreground p-3 rounded-full shadow-xl hover:bg-background hover:text-foreground border-2 border-primary transition-all group"
            aria-label="Open Wolfies chatbot"
          >
            <div className="relative">
              <MessageCircle className="w-4 h-4" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"
              />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <WolfiesChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Cookie Settings - Desktop only FAB */}
      <CookieSettings variant="fab" />

      {/* Scroll To Top - Bottom right */}
      <ScrollToTop />
    </>
  )
}
