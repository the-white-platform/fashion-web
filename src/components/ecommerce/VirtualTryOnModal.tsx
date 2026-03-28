'use client'

import { useState, useEffect } from 'react'
import { Upload, User, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface VirtualTryOnModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: number | string
    name: string
    image: string
    priceDisplay?: string
  }
}

export function VirtualTryOnModal({ isOpen, onClose, product }: VirtualTryOnModalProps) {
  const t = useTranslations()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleGenerate = async () => {
    if (!uploadedImage) return
    setIsGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/vto/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personImage: uploadedImage,
          productImage: product.image,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || t('vto.errorGeneric'))
        return
      }
      setResult(data.image)
    } catch (err) {
      setError(t('vto.errorNetwork'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setUploadedImage(null)
    setError(null)
  }

  const isFormComplete = !!uploadedImage

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto my-8 rounded-none border-4 border-foreground"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-primary text-primary-foreground rounded-none flex items-center justify-center hover:bg-primary/90 transition-all hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center pt-16 pb-12 px-6 border-b-2 border-border">
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-none mb-6 shadow-xl">
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                <span className="text-xs font-bold tracking-[0.3em] uppercase">
                  TheWhite AI Lab
                </span>
              </div>
              <h2 className="text-5xl lg:text-6xl uppercase mb-4 font-bold italic tracking-tighter italic text-foreground">
                {t('vto.title')}
              </h2>
              <p className="text-muted-foreground font-medium tracking-wide">
                {t('vto.subtitle')}
              </p>
            </div>

            {/* Main Content */}
            <div className="p-8 lg:p-12 space-y-12">
              {/* Top Section - Product Preview and Photo Upload */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Step 1: Product Preview */}
                <div className="bg-muted border-2 border-border rounded-none p-8 relative overflow-hidden group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-none flex items-center justify-center font-bold shadow-lg">
                      <span className="text-sm">01</span>
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-widest italic text-foreground">
                      {t('vto.selectedProduct')}
                    </h3>
                  </div>

                  <div className="border-4 border-foreground rounded-none p-4 bg-card shadow-2xl relative aspect-[3/4] max-w-sm mx-auto overflow-hidden">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white p-4">
                      <p className="text-xs font-bold uppercase tracking-widest line-clamp-1">
                        {product.name}
                      </p>
                      {product.priceDisplay && (
                        <p className="text-sm font-bold mt-1 text-yellow-500">
                          {product.priceDisplay}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Upload Photo */}
                <div className="bg-muted border-2 border-border rounded-none p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-none flex items-center justify-center font-bold shadow-lg">
                      <span className="text-sm">02</span>
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-widest italic text-foreground">
                      {t('vto.uploadYourPhoto')}
                    </h3>
                  </div>

                  <label className="border-4 border-dashed border-border bg-background rounded-none p-12 flex flex-col items-center justify-center cursor-pointer hover:border-foreground hover:bg-muted transition-all min-h-[450px] group relative overflow-hidden shadow-inner">
                    {uploadedImage ? (
                      <>
                        <div className="relative w-full h-full max-h-[350px] aspect-[3/4]">
                          <Image
                            src={uploadedImage}
                            alt="Uploaded"
                            fill
                            className="object-contain rounded-none shadow-2xl"
                          />
                        </div>
                        <div className="mt-6 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 uppercase text-[10px] font-bold tracking-widest">
                          <Upload className="w-3 h-3" />
                          {t('vto.changePhoto')}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <User className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-bold uppercase tracking-widest mb-2 text-foreground">
                          {t('vto.uploadPhoto')}
                        </p>
                        <p className="text-xs text-muted-foreground text-center max-w-[250px] font-medium leading-relaxed">
                          {t('vto.instructions1')}
                        </p>
                      </>
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

              {/* Result Section */}
              <div className="bg-muted border-2 border-border rounded-none p-8 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-none flex items-center justify-center font-bold shadow-lg animate-pulse">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-widest italic text-foreground">
                    {t('vto.resultTitle')}
                  </h3>
                </div>

                <div className="bg-card border-4 border-foreground rounded-none p-12 flex flex-col items-center justify-center min-h-[350px] relative shadow-2xl overflow-hidden">
                  {error ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <X className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-sm font-bold text-red-500 uppercase tracking-wider">
                        {error}
                      </p>
                      <button
                        onClick={() => setError(null)}
                        className="text-xs text-muted-foreground underline hover:text-foreground transition-colors uppercase tracking-widest font-bold"
                      >
                        {t('vto.tryRetry')}
                      </button>
                    </div>
                  ) : result ? (
                    <div className="w-full space-y-6 text-center">
                      <div className="relative w-full h-[350px] aspect-[3/4]">
                        <Image
                          src={result}
                          alt="Virtual Try-On Result"
                          fill
                          className="object-contain rounded-none shadow-xl"
                        />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-wider text-foreground italic">
                        {t('vto.resultCaption')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border shadow-inner">
                        <Sparkles className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold uppercase tracking-widest italic text-foreground">
                          {t('vto.waitingTitle')}
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-[280px] mx-auto font-medium leading-relaxed">
                          {uploadedImage ? t('vto.instructions2') : t('vto.instructions3')}
                        </p>
                      </div>
                      {isGenerating && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-6">
                          <div className="relative">
                            <div className="w-24 h-24 border-8 border-muted border-t-primary rounded-full animate-spin" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-yellow-500 animate-pulse" />
                          </div>
                          <div className="text-center">
                            <p className="font-bold uppercase tracking-[0.4em] text-sm animate-pulse text-foreground">
                              {t('vto.processing')}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-2 uppercase font-medium">
                              {t('vto.doNotClose')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                {result ? (
                  <>
                    <button
                      onClick={handleReset}
                      className="border-4 border-foreground px-12 py-5 rounded-none hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-[0.2em] font-bold text-sm shadow-xl text-foreground"
                    >
                      {t('vto.tryAgain')}
                    </button>
                    <button
                      onClick={onClose}
                      className="bg-primary text-primary-foreground px-12 py-5 rounded-none hover:bg-primary/90 transition-all uppercase tracking-[0.2em] font-bold text-sm shadow-xl"
                    >
                      {t('vto.doneClose')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!isFormComplete || isGenerating}
                    className={`px-16 py-6 rounded-none uppercase tracking-[0.4em] font-black transition-all text-sm shadow-2xl relative group overflow-hidden ${
                      isFormComplete && !isGenerating
                        ? 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
                        : 'bg-muted text-muted-foreground cursor-not-allowed border-2 border-border'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-4">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        {t('vto.processing')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Sparkles className="w-5 h-5 text-yellow-500 group-hover:rotate-12 transition-transform" />
                        {t('vto.generate')}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-8 bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] text-center border-t-2 border-border">
              {t('vto.disclaimer')}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
