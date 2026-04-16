'use client'

// Wolfies chatbot is temporarily disabled — bringing back once we
// ground it in real catalogue/policy context (otherwise it
// hallucinates SKUs, prices, and policies). To re-enable, restore
// the imports + state + JSX block from git history.
//
// import { useState } from 'react'
// import { MessageCircle } from 'lucide-react'
// import { motion, AnimatePresence } from 'motion/react'
// import dynamic from 'next/dynamic'
//
// const WolfiesChatbot = dynamic(
//   () => import('./WolfiesChatbot').then((mod) => mod.WolfiesChatbot),
//   { ssr: false },
// )
import { ScrollToTop } from './ScrollToTop'
import { CookieSettings } from './CookieSettings'

export function FloatingActions() {
  return (
    <>
      {/* Cookie Settings - Desktop only FAB */}
      <CookieSettings variant="fab" />

      {/* Scroll To Top - Bottom right */}
      <ScrollToTop />
    </>
  )
}
