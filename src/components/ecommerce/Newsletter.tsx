'use client'

import { Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function Newsletter() {
  const t = useTranslations('newsletter')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 3000)
  }

  return (
    <section className="py-20 text-foreground">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <Mail className="w-12 h-12 mx-auto mb-6" />

          <h2 className="text-3xl lg:text-4xl uppercase mb-4">{t('title')}</h2>

          <p className="text-muted-foreground mb-8">{t('description')}</p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <input
              type="email"
              placeholder={t('placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 bg-background border-2 border-input text-foreground outline-none focus:border-ring transition-colors rounded-sm placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={submitted}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-none hover:bg-primary/90 hover:text-primary-foreground border-2 border-primary transition-all hover:scale-105 whitespace-nowrap disabled:opacity-50 uppercase tracking-widest font-bold text-sm"
            >
              {submitted ? t('buttonSuccess') : t('button')}
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-4">{t('note')}</p>
        </motion.div>
      </div>
    </section>
  )
}
