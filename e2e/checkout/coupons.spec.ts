import { test, expect } from '@playwright/test'

const TEST_CART_ITEM = {
  id: 1,
  name: 'Test Product',
  price: 750000,
  image: '/assets/placeholder.jpg',
  size: 'M',
  quantity: 1,
  color: 'Black',
  colorHex: '#000000',
}

test.describe('Checkout coupon codes', () => {
  test.setTimeout(90_000)

  test.beforeEach(async ({ page }) => {
    // Pre-seed cart in localStorage BEFORE page navigation so React reads it on init
    await page.addInitScript((item) => {
      localStorage.setItem('thewhite_cart', JSON.stringify([item]))
    }, TEST_CART_ITEM)

    await page.goto('/vi/checkout')
    // Wait for the shipping form to be present (confirms non-empty cart rendered)
    await expect(page.locator('h2').filter({ hasText: 'Giao Hàng' })).toBeVisible({
      timeout: 30_000,
    })
  })

  test('coupon code input is visible on checkout page', async ({ page }) => {
    const couponInput = page.getByPlaceholder('Nhập mã')
    await expect(couponInput).toBeVisible()
  })

  test('apply button is visible next to coupon input', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Áp Dụng/i })).toBeVisible()
  })

  test('empty coupon shows a visible error', async ({ page }) => {
    await page.getByRole('button', { name: /Áp Dụng/i }).click()
    // The error paragraph renders (the app may show a key or translated text)
    const errorLocator = page.locator('p.text-xs.text-destructive')
    await expect(errorLocator).toBeVisible({ timeout: 5_000 })
    const text = await errorLocator.textContent()
    expect(text).toBeTruthy()
    // Should reference "empty" in the key or message
    expect(text).toMatch(/nhập mã|empty|errorEmpty/i)
  })

  test('invalid coupon code shows an error message', async ({ page }) => {
    await page.getByPlaceholder('Nhập mã').fill('INVALID_CODE_XYZ')
    await page.getByRole('button', { name: /Áp Dụng/i }).click()

    const errorLocator = page.locator('p.text-xs.text-destructive')
    await expect(errorLocator).toBeVisible({ timeout: 8_000 })
    const errorText = await errorLocator.textContent()
    expect(errorText).toBeTruthy()
    // The error references invalid/expired or a key containing "Invalid"
    expect(errorText).toMatch(/không hợp lệ|hết hạn|không thể|Invalid|errorInvalid/i)
  })

  test('coupon input auto-converts to uppercase', async ({ page }) => {
    const couponInput = page.getByPlaceholder('Nhập mã')
    await couponInput.fill('lowercase')
    const value = await couponInput.inputValue()
    expect(value).toBe('LOWERCASE')
  })

  test('coupon section label is visible', async ({ page }) => {
    await expect(page.getByText('Mã Giảm Giá')).toBeVisible()
  })

  test('coupon placeholder text is visible', async ({ page }) => {
    await expect(page.getByPlaceholder('Nhập mã')).toBeVisible()
  })
})
