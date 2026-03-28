import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import viMessages from '../messages/vi.json'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  // Vietnamese is statically bundled — zero async overhead for default locale
  // Other locales are dynamically imported only when needed
  const messages =
    locale === 'vi'
      ? viMessages
      : (await import(`../messages/${locale}.json`)).default

  return { locale, messages }
})
