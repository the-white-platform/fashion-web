'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Upload, User, Sparkles, X, Plus, Wand2, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

interface VirtualTryOnModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: number | string
    name: string
    image: string
    priceDisplay?: string
    color?: string
    features?: string[]
  }
}

export function VirtualTryOnModal({ isOpen, onClose, product }: VirtualTryOnModalProps) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useUser()

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Hover-zoom state for the HD result image. Null = no hover; otherwise x/y
  // are the cursor position inside the image expressed as percentages.
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(null)
  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  // Mode toggle
  const [mode, setMode] = useState<'hd' | 'ai'>('hd')

  // AI Outfit Advisor state
  const [additionalProducts, setAdditionalProducts] = useState<string[]>([]) // base64 images
  const [aiDescription, setAiDescription] = useState<string | null>(null)

  const additionalInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAdditionalProducts((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleRemoveAdditionalProduct = (index: number) => {
    setAdditionalProducts((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSignIn = () => {
    router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`)
    onClose()
  }

  const handleGenerate = async () => {
    if (!uploadedImage) return
    setIsGenerating(true)
    setError(null)

    if (mode === 'hd') {
      try {
        const res = await fetch('/api/vto/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personImage: uploadedImage,
            productImage: product.image,
            productName: product.name,
            productColor: product.color,
            // Sent so the server can log which product the user tried on
            // — used by the daily-quota counter and for analytics.
            productId: product.id,
          }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          setError(data.error || t('vto.errorGeneric'))
          return
        }
        setResult(data.image)
      } catch {
        setError(t('vto.errorNetwork'))
      } finally {
        setIsGenerating(false)
      }
    } else {
      // AI Outfit Advisor mode
      try {
        const productImages = [product.image, ...additionalProducts]
        const res = await fetch('/api/ai/vto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personImage: uploadedImage,
            productImages,
            locale,
            productName: product.name,
            productColor: product.color,
            productFeatures: product.features,
          }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          setError(data.error || t('vto.errorGeneric'))
          return
        }
        setAiDescription(data.description)
      } catch {
        setError(t('vto.errorNetwork'))
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handleReset = () => {
    setResult(null)
    setAiDescription(null)
    setUploadedImage(null)
    setAdditionalProducts([])
    setError(null)
  }

  const isFormComplete = !!uploadedImage
  const hasAnyResult = mode === 'hd' ? !!result : !!aiDescription

  // Portal to document.body so the VTO modal escapes any ancestor
  // stacking context (notably the ProductModal/QuickView Radix Dialog,
  // whose portaled content sits at z-50 — without this, mounting VTO
  // inside the ProductModal subtree left the QuickView visually
  // overlapping the VTO).
  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => {
    setPortalReady(true)
  }, [])
  if (!portalReady || typeof document === 'undefined') return null

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Content — single-screen layout: compact header + 3-column grid + thin footer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background shadow-2xl max-w-[1400px] w-full h-full max-h-[100dvh] lg:h-[95vh] lg:max-h-[95vh] rounded-none border-0 lg:border-4 border-foreground flex flex-col overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-10 h-10 bg-primary text-primary-foreground rounded-none flex items-center justify-center hover:bg-primary/90 transition-all hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Compact Header — brand + title + mode toggle on one row */}
            <div className="flex items-center justify-between px-6 py-3 border-b-2 border-border bg-background flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-none flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">AI LAB</span>
                </div>
                <h2 className="text-xl lg:text-2xl uppercase font-bold italic tracking-tighter text-foreground truncate">
                  {t('vto.title')}
                </h2>
              </div>

              {/* Mode Toggle — compact */}
              {/* Mode switcher removed: HD is the only mode now. The AI
                  outfit-advice branches below are dead code paths kept
                  so the diff stays small; they can be cleaned up
                  whenever this file is refactored. */}
            </div>

            {/* Main Content — mobile: 3 stacked cards w/ natural height + scroll;
                desktop: 2-column (inputs stacked left, result right). */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(260px,1fr)_2fr] gap-4 p-4 overflow-y-auto lg:overflow-hidden min-h-0">
              {/* Left column — product (top) + upload (bottom) stacked on desktop;
                  flows naturally on mobile. */}
              <div className="contents lg:grid lg:grid-rows-2 lg:gap-4 lg:min-h-0 lg:min-w-0">
                {/* Step 1: Product Preview */}
                <div className="bg-muted border-2 border-border rounded-none p-4 flex flex-col min-h-[260px] lg:min-h-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                    <div className="w-7 h-7 bg-primary text-primary-foreground rounded-none flex items-center justify-center font-bold text-xs">
                      01
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest italic text-foreground truncate">
                      {mode === 'ai' ? t('vto.selectedProducts') : t('vto.selectedProduct')}
                    </h3>
                  </div>

                  {/* Current product — fills available column space */}
                  <div className="border-2 border-foreground rounded-none bg-card relative flex-1 min-h-0 overflow-hidden">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest line-clamp-1">
                        {product.name}
                      </p>
                      {product.priceDisplay && (
                        <p className="text-xs font-bold mt-0.5 text-yellow-500">
                          {product.priceDisplay}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* AI mode: additional product images strip */}
                  {mode === 'ai' && (
                    <div className="mt-3 flex-shrink-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        {t('vto.additionalItems')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {additionalProducts.map((imgSrc, idx) => (
                          <div
                            key={idx}
                            className="relative w-14 h-16 border border-foreground rounded-none overflow-hidden flex-shrink-0 group/item"
                          >
                            <Image
                              src={imgSrc}
                              alt={`Additional product ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              onClick={() => handleRemoveAdditionalProduct(idx)}
                              className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-none flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => additionalInputRef.current?.click()}
                          className="w-14 h-16 border border-dashed border-border rounded-none flex flex-col items-center justify-center hover:border-foreground hover:bg-muted transition-all flex-shrink-0"
                        >
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <input
                          ref={additionalInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalProductUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Upload Photo (same column as product, second row on desktop) */}
                <div className="bg-muted border-2 border-border rounded-none p-4 flex flex-col min-h-[320px] lg:min-h-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                    <div className="w-7 h-7 bg-primary text-primary-foreground rounded-none flex items-center justify-center font-bold text-xs">
                      02
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest italic text-foreground truncate">
                      {t('vto.uploadYourPhoto')}
                    </h3>
                  </div>

                  <label className="border-2 border-dashed border-border bg-background rounded-none flex flex-col items-center justify-center cursor-pointer hover:border-foreground hover:bg-muted transition-all flex-1 min-h-0 relative overflow-hidden">
                    {uploadedImage ? (
                      <>
                        <div className="relative w-full h-full">
                          <Image
                            src={uploadedImage}
                            alt="Uploaded"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 uppercase text-[10px] font-bold tracking-widest">
                          <Upload className="w-3 h-3" />
                          {t('vto.changePhoto')}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <User className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-foreground">
                          {t('vto.uploadPhoto')}
                        </p>
                        <p className="text-[11px] text-muted-foreground max-w-[220px] leading-snug">
                          {t('vto.instructions1')}
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {/* /left column (product + upload stack) */}

              {/* Step 3: Result — full right column, takes 2x width on desktop;
                  full-width third card on mobile. */}
              <div className="bg-muted border-2 border-border rounded-none p-4 flex flex-col min-h-[420px] lg:min-h-0 overflow-hidden relative">
                <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                  <div className="w-7 h-7 bg-primary text-primary-foreground rounded-none flex items-center justify-center font-bold">
                    {mode === 'ai' ? (
                      <Wand2 className="w-3.5 h-3.5 text-yellow-500" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest italic text-foreground truncate">
                    {mode === 'ai' ? t('vto.aiResultTitle') : t('vto.resultTitle')}
                  </h3>
                </div>

                <div className="bg-card border-2 border-foreground rounded-none flex-1 min-h-0 relative overflow-auto">
                  {error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-3">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <X className="w-6 h-6 text-red-500" />
                      </div>
                      <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
                        {error}
                      </p>
                      <button
                        onClick={() => setError(null)}
                        className="text-[10px] text-muted-foreground underline hover:text-foreground transition-colors uppercase tracking-widest font-bold"
                      >
                        {t('vto.tryRetry')}
                      </button>
                    </div>
                  ) : mode === 'hd' && result ? (
                    <div className="absolute inset-0 flex flex-col">
                      {/* Hover-zoom wrapper. On hover we apply a 2x scale with
                          transform-origin tracked to cursor position so the user
                          can inspect fabric / fit detail. Touch devices keep the
                          default 1x view. */}
                      <div
                        className="relative flex-1 min-h-0 overflow-hidden cursor-zoom-in"
                        onMouseMove={handleZoomMove}
                        onMouseLeave={() => setZoomOrigin(null)}
                      >
                        <Image
                          src={result}
                          alt="Virtual Try-On Result"
                          fill
                          className="object-contain transition-transform duration-150 ease-out will-change-transform"
                          style={
                            zoomOrigin
                              ? {
                                  transform: 'scale(2)',
                                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                                }
                              : undefined
                          }
                        />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground italic text-center py-2 flex-shrink-0">
                        {t('vto.resultCaption')}
                      </p>
                    </div>
                  ) : mode === 'ai' && aiDescription ? (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          {t('vto.aiAdvisorLabel')}
                        </p>
                      </div>
                      <div className="bg-muted border-2 border-border rounded-none p-4 relative">
                        <span className="absolute top-1 left-2 text-3xl text-primary/20 font-serif leading-none select-none">
                          &ldquo;
                        </span>
                        <p className="text-xs leading-relaxed text-foreground font-medium pl-3 whitespace-pre-wrap">
                          {aiDescription}
                        </p>
                        <span className="absolute bottom-1 right-2 text-3xl text-primary/20 font-serif leading-none select-none">
                          &rdquo;
                        </span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center italic">
                        {t('vto.aiResultCaption')}
                      </p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-3">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center border-2 border-dashed border-border">
                        {mode === 'ai' ? (
                          <Wand2 className="w-8 h-8 text-muted-foreground" />
                        ) : (
                          <Sparkles className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-widest italic text-foreground">
                        {t('vto.waitingTitle')}
                      </h4>
                      <p className="text-[11px] text-muted-foreground max-w-[240px] leading-snug">
                        {uploadedImage ? t('vto.instructions2') : t('vto.instructions3')}
                      </p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 p-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
                        {mode === 'ai' ? (
                          <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-yellow-500 animate-pulse" />
                        ) : (
                          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-yellow-500 animate-pulse" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-bold uppercase tracking-[0.3em] text-xs animate-pulse text-foreground">
                          {mode === 'ai' ? t('vto.aiProcessing') : t('vto.processing')}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-1 uppercase font-medium">
                          {t('vto.doNotClose')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer — action buttons + disclaimer */}
            <div className="border-t-2 border-border bg-background flex-shrink-0">
              <div className="flex items-center justify-center gap-3 px-4 py-3">
                {hasAnyResult ? (
                  <>
                    <button
                      onClick={handleReset}
                      className="border-2 border-foreground px-6 py-2.5 rounded-none hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-[0.15em] font-bold text-xs text-foreground"
                    >
                      {t('vto.tryAgain')}
                    </button>
                    <button
                      onClick={onClose}
                      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-none hover:bg-primary/90 transition-all uppercase tracking-[0.15em] font-bold text-xs"
                    >
                      {t('vto.doneClose')}
                    </button>
                  </>
                ) : !isAuthenticated ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      {t('vto.signInNote')}
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="flex items-center gap-2 px-8 py-3 rounded-none uppercase tracking-[0.25em] font-black text-xs bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all"
                    >
                      <LogIn className="w-4 h-4" />
                      {t('vto.signInRequired')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!isFormComplete || isGenerating}
                    className={`px-8 py-3 rounded-none uppercase tracking-[0.25em] font-black transition-all text-xs group relative overflow-hidden ${
                      isFormComplete && !isGenerating
                        ? 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
                        : 'bg-muted text-muted-foreground cursor-not-allowed border-2 border-border'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {mode === 'ai' ? t('vto.aiProcessing') : t('vto.processing')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {mode === 'ai' ? (
                          <Wand2 className="w-4 h-4 text-yellow-500 group-hover:rotate-12 transition-transform" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-yellow-500 group-hover:rotate-12 transition-transform" />
                        )}
                        {mode === 'ai' ? t('vto.generateAi') : t('vto.generate')}
                      </span>
                    )}
                  </button>
                )}
              </div>
              <div className="px-4 pb-2 text-muted-foreground text-[9px] uppercase font-bold tracking-[0.2em] text-center">
                {t('vto.disclaimer')}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(overlay, document.body)
}
