'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'motion/react'
import { Ruler, User, Weight, Sparkles, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

type Gender = 'men' | 'women'
type ProductType = 'shirt' | 'pants'

export interface SmartSizePickerProps {
  /** Initial category — product detail page passes this so the picker
   *  opens pre-filtered to the product being viewed. */
  defaultProductType?: ProductType
  /** If set, "View products size X" is hidden and this runs instead.
   *  Useful in a modal on a product detail page — "Use size L" can
   *  auto-select the size on the underlying product. */
  onPickSize?: (size: string) => void
  /** Hides the outer heading / subtitle — for embeds inside a modal
   *  that already has its own title. */
  hideHeader?: boolean
}

interface RecommendResponse {
  recommendedSize: string
  confidence: number
  reasoning: string
}

export function SmartSizePicker({
  defaultProductType = 'shirt',
  onPickSize,
  hideHeader = false,
}: SmartSizePickerProps) {
  const t = useTranslations('sizeGuide')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  const [gender, setGender] = useState<Gender>('men')
  const [productType, setProductType] = useState<ProductType>(defaultProductType)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecommendResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setHeight('')
    setWeight('')
    setChest('')
    setWaist('')
    setResult(null)
    setError(null)
  }

  const submit = async () => {
    const h = Number(height)
    const w = Number(weight)
    if (!h || !w) {
      setError(t('calculator.alertRequired'))
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai/size-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender,
          productType,
          heightCm: h,
          weightKg: w,
          chestCm: chest ? Number(chest) : undefined,
          waistCm: waist ? Number(waist) : undefined,
          locale: locale === 'en' ? 'en' : 'vi',
        }),
      })
      if (!res.ok) {
        setError(t('calculator.errorGeneric'))
        return
      }
      const data = (await res.json()) as RecommendResponse
      setResult(data)
    } catch {
      setError(t('calculator.errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const confidenceIcon =
    result && result.confidence >= 80
      ? { Icon: CheckCircle, tone: 'text-success' }
      : result && result.confidence >= 60
        ? { Icon: AlertCircle, tone: 'text-warning' }
        : { Icon: TrendingUp, tone: 'text-warning' }

  return (
    <div
      className={
        hideHeader
          ? 'flex flex-col gap-4'
          : 'bg-gradient-to-br from-foreground to-foreground/80 text-background border-2 border-foreground rounded-sm p-8'
      }
    >
      {!hideHeader && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-3xl uppercase tracking-wide">{t('calculator.title')}</h2>
          </div>
          <p className="opacity-80 mb-8">{t('calculator.desc')}</p>
        </>
      )}

      <div className={hideHeader ? 'contents' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        {/* Input form */}
        <div className="bg-background text-foreground rounded-sm p-6 space-y-6">
          {/* Gender */}
          <div>
            <label className="block text-sm uppercase tracking-wide mb-3">
              {t('calculator.gender.label')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['men', 'women'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-3 border-2 rounded-sm transition-all ${
                    gender === g
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border hover:border-foreground'
                  }`}
                >
                  {t(`calculator.gender.${g === 'men' ? 'male' : 'female'}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Product type */}
          <div>
            <label className="block text-sm uppercase tracking-wide mb-3">
              {t('calculator.type.label')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['shirt', 'pants'] as const).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setProductType(pt)}
                  className={`py-3 border-2 rounded-sm transition-all ${
                    productType === pt
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border hover:border-foreground'
                  }`}
                >
                  {t(`calculator.type.${pt}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-2 gap-4">
            <MeasurementInput
              label={t('calculator.height')}
              required
              icon={<Ruler />}
              value={height}
              onChange={setHeight}
              placeholder="170"
            />
            <MeasurementInput
              label={t('calculator.weight')}
              required
              icon={<Weight />}
              value={weight}
              onChange={setWeight}
              placeholder="65"
            />
            <MeasurementInput
              label={t('chart.headers.chest')}
              icon={<Ruler />}
              value={chest}
              onChange={setChest}
              placeholder="90"
            />
            <MeasurementInput
              label={t('chart.headers.waist')}
              icon={<Ruler />}
              value={waist}
              onChange={setWaist}
              placeholder="80"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="flex-1 whitespace-nowrap bg-foreground text-background py-3 px-4 rounded-sm hover:opacity-90 disabled:opacity-50 transition-all uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>{loading ? t('calculator.finding') : t('calculator.find')}</span>
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={loading}
              className="px-6 py-3 whitespace-nowrap border-2 border-border bg-background text-foreground rounded-sm hover:border-foreground disabled:opacity-50 transition-all uppercase tracking-wide"
            >
              {t('calculator.reset')}
            </button>
          </div>
        </div>

        {/* Result — hide the empty-state card inside the modal (hideHeader) since
            the form description already tells the user what to do. Keeps the
            loading/result views for both contexts. */}
        {(loading || result || !hideHeader) && (
          <div className="bg-background text-foreground rounded-sm p-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Sparkles className="w-10 h-10 mx-auto mb-3 animate-pulse" />
                  <p>{t('calculator.finding')}</p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full text-center space-y-5"
                >
                  <div className="w-24 h-24 bg-foreground text-background rounded-full flex items-center justify-center mx-auto text-4xl font-bold">
                    {result.recommendedSize}
                  </div>
                  <div>
                    <h3 className="text-2xl uppercase tracking-wide mb-2">
                      {t('calculator.result.title')}
                    </h3>
                    <p className="text-muted-foreground mb-1">
                      {t('calculator.result.fit')}:{' '}
                      <span className="font-bold text-foreground">{result.confidence}%</span>
                    </p>
                    <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden mt-2 mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-foreground"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <confidenceIcon.Icon className={`w-5 h-5 ${confidenceIcon.tone}`} />
                      <span className={`text-sm ${confidenceIcon.tone}`}>
                        {t('calculator.result.fit')}
                      </span>
                    </div>
                    {result.reasoning && (
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        {result.reasoning}
                      </p>
                    )}
                  </div>
                  {onPickSize ? (
                    <button
                      type="button"
                      onClick={() => onPickSize(result.recommendedSize)}
                      className="w-full py-3 border-2 border-foreground bg-foreground text-background rounded-sm hover:opacity-90 transition-all uppercase tracking-wide"
                    >
                      {tCommon('apply')} size {result.recommendedSize}
                    </button>
                  ) : (
                    <a
                      href={`/${locale}/products?sizes=${result.recommendedSize}`}
                      className="block w-full py-3 border-2 border-foreground bg-background text-foreground rounded-sm hover:bg-foreground hover:text-background transition-all uppercase tracking-wide"
                    >
                      {t('calculator.result.viewProducts', { size: result.recommendedSize })}
                    </a>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{t('calculator.desc')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

interface MeasurementInputProps {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}

function MeasurementInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  required,
}: MeasurementInputProps) {
  return (
    <div>
      <label className="block text-sm uppercase tracking-wide mb-2 text-foreground">
        {label}
        {required && (
          // Bold + larger than the inline `text-destructive *` used
          // previously — the old asterisks were near-invisible on the
          // white card because destructive's default foreground is a
          // subdued red. High-contrast red + bold reads clearly.
          <span className="ml-0.5 text-rose-600 font-bold text-base">*</span>
        )}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-3 border-2 border-border rounded-sm outline-none focus:border-foreground transition-colors bg-background text-foreground"
        />
      </div>
    </div>
  )
}
