import { test, expect } from '@playwright/test'

// Use a known product URL to avoid loading the listing page during parallel tests
// DB has products with IDs 1–12 (v1 products seeded)
const PRODUCT_URL = '/vi/products/1'

// Seed cart using addInitScript (runs BEFORE React hydration, so useState lazy init reads it)
async function seedCartViaInitScript(page: import('@playwright/test').Page, quantity = 1) {
  await page.addInitScript((qty) => {
    const item = {
      id: 1,
      name: 'Test Cart Item',
      price: 500000,
      image: '/assets/placeholder.jpg',
      size: 'M',
      quantity: qty,
      // no color field — color is undefined, matches CartContext updateQuantity/removeFromCart default
    }
    localStorage.setItem('thewhite_cart', JSON.stringify([item]))
  }, quantity)
  await page.goto(PRODUCT_URL)
  await page.waitForLoadState('domcontentloaded')
}

async function addItemToCart(page: import('@playwright/test').Page) {
  await page.goto(PRODUCT_URL)
  await page.waitForLoadState('domcontentloaded')

  // Select a size if available
  const sizeBtns = page.locator('button', { hasText: /^(XS|S|M|L|XL|2X)$/ })
  if ((await sizeBtns.count()) > 0) {
    await sizeBtns.first().click()
  }

  const addBtn = page.getByRole('button', { name: /Thêm Vào Giỏ Hàng/i })
  const isInStock = await addBtn.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!isInStock) {
    // Try product 2 as fallback
    await page.goto('/vi/products/2')
    await page.waitForLoadState('domcontentloaded')
    const sizeBtns96 = page.locator('button', { hasText: /^(XS|S|M|L|XL|2X)$/ })
    if ((await sizeBtns96.count()) > 0) await sizeBtns96.first().click()
    const addBtn96 = page.getByRole('button', { name: /Thêm Vào Giỏ Hàng/i })
    await addBtn96.waitFor({ timeout: 5_000 })
    await addBtn96.click()
    return
  }

  await addBtn.click()
}

// Wait for the cart sheet animation to fully open before interacting with its contents
async function openCartAndWait(page: import('@playwright/test').Page) {
  const cartTitle = page
    .locator('[data-slot="sheet-title"], [role="dialog"] h2')
    .filter({ hasText: 'Giỏ Hàng' })
  await expect(cartTitle).toBeVisible({ timeout: 8_000 })
  // Wait for the Radix Sheet slide-in animation (duration-500 + buffer)
  await page.waitForTimeout(2000)
  // Verify the sheet content is in the viewport before proceeding
  await page.waitForSelector('[data-slot="sheet-content"]', { state: 'visible', timeout: 5_000 })
}

// Open the cart drawer by clicking the cart icon in the header
async function openCartDrawer(page: import('@playwright/test').Page) {
  // Use exact match to avoid matching "Thêm Vào Giỏ Hàng" button on product page
  const cartBtn = page.getByRole('button', { name: 'Giỏ Hàng', exact: true })
  await cartBtn.click()
  await openCartAndWait(page)
}

test.describe('Cart operations', () => {
  test('add product to cart opens cart drawer', async ({ page }) => {
    await addItemToCart(page)
    const cartTitle = page
      .locator('[data-slot="sheet-title"], [role="dialog"] h2')
      .filter({ hasText: 'Giỏ Hàng' })
    await expect(cartTitle).toBeVisible({ timeout: 8_000 })
  })

  test('cart drawer shows added item name', async ({ page }) => {
    await addItemToCart(page)
    await openCartAndWait(page)
    const itemName = page.locator('[role="dialog"] h3').first()
    await expect(itemName).toBeVisible({ timeout: 5_000 })
  })

  test('cart shows total price label', async ({ page }) => {
    await addItemToCart(page)
    await openCartAndWait(page)
    await expect(page.getByText('Tổng Cộng:')).toBeVisible({ timeout: 5_000 })
  })

  test('cart item quantity can be increased', async ({ page }) => {
    // Seed cart BEFORE React mounts using addInitScript
    await seedCartViaInitScript(page, 1)
    await openCartDrawer(page)

    const qtySpan = page.locator('[role="dialog"] span.w-8.text-center').first()
    await expect(qtySpan).toHaveText('1', { timeout: 5_000 })

    const plusBtn = page
      .locator('[role="dialog"]')
      .locator('button')
      .filter({ has: page.locator('.lucide-plus') })
      .first()
    await plusBtn.click()
    await expect(qtySpan).toHaveText('2', { timeout: 5_000 })
  })

  test('cart item quantity can be decreased', async ({ page }) => {
    // Seed cart with quantity 2 BEFORE React mounts
    await seedCartViaInitScript(page, 2)
    await openCartDrawer(page)

    const qtySpan = page.locator('[role="dialog"] span.w-8.text-center').first()
    await expect(qtySpan).toHaveText('2', { timeout: 5_000 })

    const minusBtn = page
      .locator('[role="dialog"]')
      .locator('button')
      .filter({ has: page.locator('.lucide-minus') })
      .first()
    await minusBtn.scrollIntoViewIfNeeded()
    await minusBtn.click()
    await expect(qtySpan).toHaveText('1', { timeout: 5_000 })
  })

  test('removing the item from cart empties it', async ({ page }) => {
    // Seed cart BEFORE React mounts using addInitScript
    await seedCartViaInitScript(page, 1)
    await openCartDrawer(page)

    const removeBtn = page
      .locator('[role="dialog"]')
      .locator('button')
      .filter({ has: page.locator('.lucide-x') })
      .first()
    await removeBtn.click()

    await expect(page.getByText('Giỏ hàng trống')).toBeVisible({ timeout: 5_000 })
  })

  test('cart persists after page reload via localStorage', async ({ page }) => {
    await addItemToCart(page)
    await openCartAndWait(page)

    await page.reload()
    const cart = await page.evaluate(() => {
      const raw = localStorage.getItem('thewhite_cart')
      return raw ? JSON.parse(raw) : []
    })
    expect(Array.isArray(cart)).toBe(true)
    expect(cart.length).toBeGreaterThan(0)
  })

  test('checkout button in cart navigates to checkout', async ({ page }) => {
    // Seed cart BEFORE React mounts so it has items
    await seedCartViaInitScript(page, 1)
    await openCartDrawer(page)

    const checkoutLink = page.locator('[role="dialog"]').getByRole('link', { name: /Thanh Toán/i })
    await checkoutLink.click()
    await expect(page).toHaveURL(/\/checkout/, { timeout: 15_000 })
  })

  test('continue shopping button closes cart drawer', async ({ page }) => {
    await addItemToCart(page)
    await openCartAndWait(page)

    const continueBtn = page
      .locator('[role="dialog"]')
      .getByRole('button', { name: /Tiếp Tục Mua Sắm/i })
    await continueBtn.click()
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5_000 })
  })
})
