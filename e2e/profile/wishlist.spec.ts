import { test, expect } from '@playwright/test'

const PRODUCT_URL = '/vi/products/97'

// Seed wishlist via localStorage before React mounts
async function seedWishlistViaInitScript(
  page: import('@playwright/test').Page,
  items: Array<{
    id: number
    name: string
    price: number
    priceDisplay: string
    image: string
    inStock: boolean
    sizes: string[]
    category: string
  }>,
) {
  await page.addInitScript((wishlistItems) => {
    localStorage.setItem('thewhite_wishlist', JSON.stringify(wishlistItems))
  }, items)
}

test.describe('Wishlist', () => {
  test('wishlist page shows empty state when no items', async ({ page }) => {
    // Clear wishlist before navigating
    await page.addInitScript(() => {
      localStorage.removeItem('thewhite_wishlist')
    })
    await page.goto('/vi/wishlist')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Danh Sách Yêu Thích Trống')).toBeVisible({ timeout: 10_000 })
  })

  test('wishlist page heading is visible', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('thewhite_wishlist')
    })
    await page.goto('/vi/wishlist')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: 'Danh Sách Yêu Thích' }).first()).toBeVisible({
      timeout: 8_000,
    })
  })

  test('wishlist page shows items seeded in localStorage', async ({ page }) => {
    await seedWishlistViaInitScript(page, [
      {
        id: 97,
        name: 'Sản Phẩm Test',
        price: 500000,
        priceDisplay: '500,000₫',
        image: '/assets/placeholder.jpg',
        inStock: true,
        sizes: ['S', 'M', 'L'],
        category: 'Test',
      },
    ])
    await page.goto('/vi/wishlist')
    await page.waitForLoadState('domcontentloaded')

    // Product name should appear
    await expect(page.getByText('Sản Phẩm Test')).toBeVisible({ timeout: 10_000 })
    // Item count shows 1
    await expect(page.getByText('1 sản phẩm')).toBeVisible({ timeout: 5_000 })
  })

  test('remove from wishlist button exists on wishlist items', async ({ page }) => {
    await seedWishlistViaInitScript(page, [
      {
        id: 97,
        name: 'Sản Phẩm Test',
        price: 500000,
        priceDisplay: '500,000₫',
        image: '/assets/placeholder.jpg',
        inStock: true,
        sizes: ['S', 'M', 'L'],
        category: 'Test',
      },
    ])
    await page.goto('/vi/wishlist')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Sản Phẩm Test')).toBeVisible({ timeout: 10_000 })

    // Remove button is a Heart icon button (filled red) on the image
    const removeBtn = page
      .locator('button')
      .filter({ has: page.locator('.lucide-heart') })
      .first()
    await expect(removeBtn).toBeVisible({ timeout: 5_000 })
  })

  test('remove from wishlist removes the item', async ({ page }) => {
    await seedWishlistViaInitScript(page, [
      {
        id: 97,
        name: 'Sản Phẩm Test',
        price: 500000,
        priceDisplay: '500,000₫',
        image: '/assets/placeholder.jpg',
        inStock: true,
        sizes: ['S', 'M', 'L'],
        category: 'Test',
      },
    ])
    await page.goto('/vi/wishlist')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Sản Phẩm Test')).toBeVisible({ timeout: 10_000 })

    const removeBtn = page
      .locator('button')
      .filter({ has: page.locator('.lucide-heart') })
      .first()
    await removeBtn.click()

    // After removal, empty state should appear
    await expect(page.getByText('Danh Sách Yêu Thích Trống')).toBeVisible({ timeout: 8_000 })
  })

  test('wishlist persists after page reload', async ({ page }) => {
    await seedWishlistViaInitScript(page, [
      {
        id: 97,
        name: 'Sản Phẩm Test',
        price: 500000,
        priceDisplay: '500,000₫',
        image: '/assets/placeholder.jpg',
        inStock: true,
        sizes: ['S', 'M', 'L'],
        category: 'Test',
      },
    ])
    await page.goto('/vi/wishlist')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText('Sản Phẩm Test')).toBeVisible({ timeout: 10_000 })

    // Reload and verify localStorage persistence
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    const wishlist = await page.evaluate(() => {
      const raw = localStorage.getItem('thewhite_wishlist')
      return raw ? JSON.parse(raw) : []
    })
    expect(Array.isArray(wishlist)).toBe(true)
    expect(wishlist.length).toBeGreaterThan(0)
  })

  test('wishlist page shows add to cart button for in-stock items', async ({ page }) => {
    await seedWishlistViaInitScript(page, [
      {
        id: 97,
        name: 'Sản Phẩm Test',
        price: 500000,
        priceDisplay: '500,000₫',
        image: '/assets/placeholder.jpg',
        inStock: true,
        sizes: ['S', 'M', 'L'],
        category: 'Test',
      },
    ])
    await page.goto('/vi/wishlist')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Sản Phẩm Test')).toBeVisible({ timeout: 10_000 })

    // "Thêm Vào Giỏ" button for each in-stock item
    await expect(page.getByRole('button', { name: /Thêm Vào Giỏ/i }).first()).toBeVisible({
      timeout: 5_000,
    })
  })

  test('wishlist button on product detail page toggles wishlist state', async ({ page }) => {
    // Clear wishlist first
    await page.addInitScript(() => {
      localStorage.removeItem('thewhite_wishlist')
    })

    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('domcontentloaded')

    // The wishlist toggle button shows "Yêu Thích" initially
    const wishlistBtn = page.getByRole('button', { name: /Yêu Thích|Đã Lưu/i })
    await expect(wishlistBtn).toBeVisible({ timeout: 10_000 })

    const before = await wishlistBtn.textContent()
    await wishlistBtn.click()
    await page.waitForTimeout(300)

    const after = await wishlistBtn.textContent()
    expect(after).not.toBe(before)
  })
})
