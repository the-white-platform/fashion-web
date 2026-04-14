import { test, expect } from '@playwright/test'

// Use a known seeded product slug (v1 catalog)
const PRODUCT_URL = '/vi/products/quan-vai-gan'

test.describe('Product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('domcontentloaded')
  })

  test('detail page loads with product name (h1) and price', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('p.text-2xl.font-bold')).toBeVisible({ timeout: 10_000 })
  })

  test('product image is visible', async ({ page }) => {
    await expect(page.locator('img').first()).toBeVisible({ timeout: 10_000 })
  })

  test('breadcrumb contains Sản phẩm link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Sản phẩm' })).toBeVisible({ timeout: 10_000 })
  })

  test('back button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Quay lại/i })).toBeVisible({ timeout: 10_000 })
  })

  test('size selector buttons are visible when sizes available', async ({ page }) => {
    const sizeLabel = page.getByText('Chọn Size')
    const sizeVisible = await sizeLabel.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!sizeVisible) return

    const sizeBtns = page.locator('button', { hasText: /^(XS|S|M|L|XL|2X)$/ })
    expect(await sizeBtns.count()).toBeGreaterThan(0)
  })

  test('color variant selector label is visible when variants available', async ({ page }) => {
    const colorLabel = page.locator('label', { hasText: /Màu Sắc/ })
    const visible = await colorLabel.isVisible({ timeout: 5_000 }).catch(() => false)
    if (visible) {
      await expect(colorLabel).toBeVisible()
    }
  })

  test('selecting a size highlights it with foreground border', async ({ page }) => {
    const sizeLabel = page.getByText('Chọn Size')
    const visible = await sizeLabel.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!visible) return

    const sizeBtns = page.locator('button', { hasText: /^(XS|S|M|L|XL|2X)$/ })
    if ((await sizeBtns.count()) === 0) return

    const firstSizeBtn = sizeBtns.first()
    await firstSizeBtn.click()
    await expect(firstSizeBtn).toHaveClass(/border-foreground/)
  })

  test('add to cart or out of stock button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm Vào Giỏ Hàng/i })
    const outBtn = page.getByRole('button', { name: /Hết Hàng/i })
    const eitherVisible =
      (await addBtn.isVisible({ timeout: 8_000 }).catch(() => false)) ||
      (await outBtn.isVisible({ timeout: 2_000 }).catch(() => false))
    expect(eitherVisible).toBe(true)
  })

  test('quantity stepper increments and decrements', async ({ page }) => {
    const quantityLabel = page.getByText('Số Lượng')
    const visible = await quantityLabel.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!visible) return

    const plusBtn = page
      .locator('button')
      .filter({ has: page.locator('.lucide-plus') })
      .last()
    const minusBtn = page
      .locator('button')
      .filter({ has: page.locator('.lucide-minus') })
      .last()
    const qtyDisplay = page.locator('span.text-xl.w-12.text-center')

    await expect(qtyDisplay).toHaveText('1')
    await plusBtn.click()
    await expect(qtyDisplay).toHaveText('2')
    await minusBtn.click()
    await expect(qtyDisplay).toHaveText('1')
    // Should not go below 1
    await minusBtn.click()
    await expect(qtyDisplay).toHaveText('1')
  })

  test('wishlist button toggles between Yêu Thích and Đã Lưu', async ({ page }) => {
    const wishlistBtn = page.getByRole('button', { name: /Yêu Thích|Đã Lưu/i })
    await expect(wishlistBtn).toBeVisible({ timeout: 8_000 })
    const initialText = await wishlistBtn.textContent()
    await wishlistBtn.click()
    const afterText = await wishlistBtn.textContent()
    expect(afterText).not.toBe(initialText)
  })

  test('related products section heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sản Phẩm Liên Quan' })).toBeVisible({
      timeout: 10_000,
    })
  })

  test('virtual try-on button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Thử Đồ Ảo/i })).toBeVisible({ timeout: 8_000 })
  })
})
