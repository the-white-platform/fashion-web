import { test, expect } from '@playwright/test'

// Cart item to use for all checkout tests
const TEST_CART_ITEM = {
  id: 1,
  name: 'Test Product',
  price: 500000,
  image: '/assets/placeholder.jpg',
  size: 'M',
  quantity: 1,
  color: 'Black',
  colorHex: '#000000',
}

// Wait for checkout page to be interactive (shipping step loaded)
async function waitForShippingStep(page: import('@playwright/test').Page) {
  // The shipping form is present in the h2 heading inside the form card
  await expect(page.locator('h2').filter({ hasText: 'Giao Hàng' })).toBeVisible({ timeout: 30_000 })
}

test.describe('Checkout flow', () => {
  test.setTimeout(90_000)

  test.beforeEach(async ({ page }) => {
    // Pre-seed cart in localStorage BEFORE page navigation so React reads it on init
    await page.addInitScript((item) => {
      localStorage.setItem('thewhite_cart', JSON.stringify([item]))
    }, TEST_CART_ITEM)
  })

  test('empty cart shows empty state on checkout', async ({ page }) => {
    // Override: use empty cart
    await page.addInitScript(() => {
      localStorage.removeItem('thewhite_cart')
    })
    await page.goto('/vi/checkout')
    await expect(page.getByText('Giỏ hàng trống')).toBeVisible({ timeout: 10_000 })
  })

  test('checkout page with cart shows shipping step', async ({ page }) => {
    await page.goto('/vi/checkout')
    await waitForShippingStep(page)
  })

  test('checkout progress bar shows 3 steps', async ({ page }) => {
    await page.goto('/vi/checkout')
    await waitForShippingStep(page)
    // Progress bar spans: Giao Hàng, Thanh Toán, Xác Nhận
    await expect(page.locator('span', { hasText: 'Giao Hàng' }).first()).toBeVisible()
    await expect(page.locator('span', { hasText: 'Thanh Toán' }).first()).toBeVisible()
    await expect(page.locator('span', { hasText: 'Xác Nhận' }).first()).toBeVisible()
  })

  test('order summary sidebar shows item name and total', async ({ page }) => {
    await page.goto('/vi/checkout')
    await waitForShippingStep(page)
    await expect(page.getByText('Đơn Hàng')).toBeVisible()
    await expect(page.getByText('Test Product')).toBeVisible()
    await expect(page.getByText('Tổng cộng')).toBeVisible()
  })

  test('can fill shipping form and proceed to payment step', async ({ page }) => {
    await page.goto('/vi/checkout')
    await waitForShippingStep(page)

    await page.getByPlaceholder('Nguyễn Văn A').fill('Nguyễn Test')
    await page.getByPlaceholder('0901234567').fill('0901234567')
    await page.getByPlaceholder('Số nhà, tên đường').fill('123 Đường Test')

    // Province: the AddressSelect is an input with placeholder "Chọn Tỉnh/Thành phố"
    const provinceInput = page.getByPlaceholder('Chọn Tỉnh/Thành phố')
    await provinceInput.waitFor({ timeout: 10_000 })
    await provinceInput.click()
    const firstOption = page.locator('[role="option"]').first()
    await firstOption.waitFor({ timeout: 10_000 })
    await firstOption.click()

    await page.getByRole('button', { name: /Tiếp Theo/i }).click()

    // Should advance to payment step
    await expect(page.locator('h2').filter({ hasText: 'Thanh Toán' })).toBeVisible({
      timeout: 8_000,
    })
  })

  test('payment step shows bank and COD payment options', async ({ page }) => {
    await page.goto('/vi/checkout')
    await waitForShippingStep(page)

    await page.getByPlaceholder('Nguyễn Văn A').fill('Test User')
    await page.getByPlaceholder('0901234567').fill('0987654321')
    await page.getByPlaceholder('Số nhà, tên đường').fill('456 Test Street')

    const provinceInput = page.getByPlaceholder('Chọn Tỉnh/Thành phố')
    await provinceInput.waitFor({ timeout: 10_000 })
    await provinceInput.click()
    const firstOption = page.locator('[role="option"]').first()
    await firstOption.waitFor({ timeout: 10_000 })
    await firstOption.click()

    await page.getByRole('button', { name: /Tiếp Theo/i }).click()
    await expect(page.locator('h2').filter({ hasText: 'Thanh Toán' })).toBeVisible({
      timeout: 8_000,
    })

    // Payment type buttons (bank & COD)
    await expect(
      page
        .getByRole('button')
        .filter({ hasText: /Chuyển khoản|QR|bank/i })
        .first(),
    ).toBeVisible()
    await expect(
      page
        .getByRole('button')
        .filter({ hasText: /khi nhận hàng|COD/i })
        .first(),
    ).toBeVisible()
  })

  test('back to cart button is visible', async ({ page }) => {
    await page.goto('/vi/checkout')
    await waitForShippingStep(page)
    await expect(page.getByText('Quay lại giỏ hàng')).toBeVisible()
  })
})
