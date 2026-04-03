import { test, expect } from '@playwright/test'

/**
 * i18n / locale tests.
 *
 * The CMS overrides desktop nav items with English labels ("Men", "Women", etc.)
 * on ALL locales. To detect the active locale we instead look at:
 * - Hero CTA text: "Khám Phá Ngay" (vi) vs "Explore Now" (en)
 * - The language-switcher button which shows the current locale code ("vi" or "en")
 * - URL prefix (/vi or /en)
 *
 * The language switcher navigates to /en or /vi (no trailing slash).
 */
test.describe('i18n locale routing', () => {
  // -------------------------------------------------------------------------
  // Vietnamese (/vi)
  // -------------------------------------------------------------------------

  test('/vi/ homepage loads in Vietnamese', async ({ page }) => {
    await page.goto('/vi')
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toMatch(/\/vi/)

    // Hero CTA is "Khám Phá Ngay" on the Vietnamese homepage
    const heroCta = page
      .getByRole('link', { name: /Khám Phá Ngay/i })
      .or(page.getByText(/Khám Phá Ngay/i).first())
    await expect(heroCta.first()).toBeVisible({ timeout: 15_000 })
  })

  test('/vi/products loads in Vietnamese', async ({ page }) => {
    await page.goto('/vi/products')
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toMatch(/\/vi\/products/)

    // Language switcher shows current locale "vi"
    const switcher = page.locator('button').filter({ hasText: /vi/i }).first()
    await expect(switcher).toBeVisible({ timeout: 15_000 })
  })

  // -------------------------------------------------------------------------
  // English (/en)
  // -------------------------------------------------------------------------

  test('/en/ homepage loads in English', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toMatch(/\/en/)

    // Hero CTA is "Explore Now" on the English homepage
    const heroCta = page
      .getByRole('link', { name: /Explore Now/i })
      .or(page.getByText(/Explore Now/i).first())
    await expect(heroCta.first()).toBeVisible({ timeout: 15_000 })
  })

  test('/en/products loads in English', async ({ page }) => {
    await page.goto('/en/products')
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toMatch(/\/en\/products/)

    // Language switcher shows "🇺🇸en" — match partial text "en"
    // (button may also contain the flag emoji before the locale code)
    const switcher = page.locator('button').filter({ hasText: /en/ }).first()
    await expect(switcher).toBeVisible({ timeout: 15_000 })
  })

  // -------------------------------------------------------------------------
  // Language switcher
  // -------------------------------------------------------------------------

  test('language switcher changes locale from Vietnamese to English', async ({ page }) => {
    await page.goto('/vi')
    await page.waitForLoadState('networkidle')

    // The LanguageSwitcher trigger shows flag + locale code: "🇻🇳vi"
    const trigger = page.locator('button').filter({ hasText: /vi/i }).first()
    await trigger.click()

    // Click English option in dropdown
    const englishOption = page.getByRole('menuitem', { name: /English/i })
    await englishOption.waitFor({ state: 'visible', timeout: 10_000 })
    await englishOption.click()

    // URL should now contain /en (with or without trailing slash)
    await page.waitForURL(/\/en/, { timeout: 15_000 })
    await page.waitForLoadState('networkidle').catch(() => {})
    expect(page.url()).toMatch(/\/en/)

    // Hero text changes to English
    const heroCta = page
      .getByRole('link', { name: /Explore Now/i })
      .or(page.getByText(/Explore Now/i).first())
    await expect(heroCta.first()).toBeVisible({ timeout: 20_000 })
  })

  test('language switcher changes locale from English to Vietnamese', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    // The LanguageSwitcher trigger shows "🇺🇸en" — match partial "en"
    const trigger = page.locator('button').filter({ hasText: /en/ }).first()
    await trigger.click()

    const viOption = page.getByRole('menuitem', { name: /Tiếng Việt/i })
    await viOption.waitFor({ state: 'visible', timeout: 10_000 })
    await viOption.click()

    await page.waitForURL(/\/vi/, { timeout: 15_000 })
    await page.waitForLoadState('networkidle').catch(() => {})
    expect(page.url()).toMatch(/\/vi/)

    // Hero text changes to Vietnamese
    const heroCta = page
      .getByRole('link', { name: /Khám Phá Ngay/i })
      .or(page.getByText(/Khám Phá Ngay/i).first())
    await expect(heroCta.first()).toBeVisible({ timeout: 20_000 })
  })
})
