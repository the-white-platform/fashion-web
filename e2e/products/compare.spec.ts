import { test, expect } from '@playwright/test'
import type { ProductForFrontend } from '../../src/utilities/getProducts'

// Sample product for seeding compare state
const SAMPLE_PRODUCT_1: ProductForFrontend = {
  id: 97,
  name: 'Sản Phẩm Test 1',
  slug: 'san-pham-test-1',
  category: 'Áo',
  categories: ['Áo'],
  categorySlug: 'ao',
  price: '500,000₫',
  priceNumber: 500000,
  originalPrice: undefined,
  image: '/assets/placeholder.jpg',
  images: ['/assets/placeholder.jpg'],
  colorVariants: [],
  inStock: true,
  sizes: ['S', 'M', 'L'],
  colors: [],
  tag: '',
  featured: false,
  averageRating: 0,
  reviewCount: 0,
  description: 'Mô tả sản phẩm 1',
  features: [],
}

const SAMPLE_PRODUCT_2: ProductForFrontend = {
  id: 96,
  name: 'Sản Phẩm Test 2',
  slug: 'san-pham-test-2',
  category: 'Quần',
  categories: ['Quần'],
  categorySlug: 'quan',
  price: '600,000₫',
  priceNumber: 600000,
  originalPrice: undefined,
  image: '/assets/placeholder.jpg',
  images: ['/assets/placeholder.jpg'],
  colorVariants: [],
  inStock: true,
  sizes: ['M', 'L', 'XL'],
  colors: [],
  tag: '',
  featured: false,
  averageRating: 0,
  reviewCount: 0,
  description: 'Mô tả sản phẩm 2',
  features: [],
}

async function seedCompareViaInitScript(
  page: import('@playwright/test').Page,
  items: ProductForFrontend[],
) {
  await page.addInitScript((compareItems) => {
    localStorage.setItem('thewhite_compare', JSON.stringify(compareItems))
  }, items)
}

test.describe('Compare', () => {
  test('compare page with no items shows empty state', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('thewhite_compare')
    })
    await page.goto('/vi/compare')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Chưa có sản phẩm để so sánh')).toBeVisible({ timeout: 10_000 })
  })

  test('compare empty state shows browse products link', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('thewhite_compare')
    })
    await page.goto('/vi/compare')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('link', { name: /Khám Phá Sản Phẩm/i })).toBeVisible({
      timeout: 8_000,
    })
  })

  test('compare page with 1 item shows min required message', async ({ page }) => {
    await seedCompareViaInitScript(page, [SAMPLE_PRODUCT_1])
    await page.goto('/vi/compare')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Chọn ít nhất 2 sản phẩm để so sánh')).toBeVisible({
      timeout: 10_000,
    })
  })

  test('compare page with 2 items shows comparison table', async ({ page }) => {
    await seedCompareViaInitScript(page, [SAMPLE_PRODUCT_1, SAMPLE_PRODUCT_2])
    await page.goto('/vi/compare')
    await page.waitForLoadState('domcontentloaded')

    // The page heading "So Sánh Sản Phẩm" should be visible
    await expect(page.getByRole('heading', { name: 'So Sánh Sản Phẩm' })).toBeVisible({
      timeout: 10_000,
    })

    // The comparison table should be visible
    await expect(page.locator('table')).toBeVisible({ timeout: 8_000 })
  })

  test('compare table shows price, category, sizes rows', async ({ page }) => {
    await seedCompareViaInitScript(page, [SAMPLE_PRODUCT_1, SAMPLE_PRODUCT_2])
    await page.goto('/vi/compare')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 })

    // Table row labels
    await expect(page.getByRole('cell', { name: 'Giá' })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('cell', { name: 'Danh Mục' })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('cell', { name: 'Size' })).toBeVisible({ timeout: 5_000 })
  })

  test('compare bar appears when a product is added to compare list via localStorage', async ({
    page,
  }) => {
    await seedCompareViaInitScript(page, [SAMPLE_PRODUCT_1])
    await page.goto('/vi/products')
    await page.waitForLoadState('domcontentloaded')

    // CompareBar fixed at bottom should be visible when items.length > 0
    const compareBar = page.locator('.fixed.bottom-0')
    await expect(compareBar).toBeVisible({ timeout: 10_000 })
  })

  test('compare bar shows comparing label when items present', async ({ page }) => {
    await seedCompareViaInitScript(page, [SAMPLE_PRODUCT_1])
    await page.goto('/vi/products')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Đang so sánh')).toBeVisible({ timeout: 10_000 })
  })

  test('compare bar clear all button removes all items', async ({ page }) => {
    await seedCompareViaInitScript(page, [SAMPLE_PRODUCT_1])
    await page.goto('/vi/products')
    await page.waitForLoadState('domcontentloaded')

    const compareBar = page.locator('.fixed.bottom-0')
    await expect(compareBar).toBeVisible({ timeout: 10_000 })

    const clearBtn = compareBar.getByText('Xóa tất cả')
    await clearBtn.click()

    // Compare bar should disappear after clearing
    await expect(compareBar).not.toBeVisible({ timeout: 5_000 })
  })

  test('compare bar compare button navigates to /compare when 2+ items', async ({ page }) => {
    await seedCompareViaInitScript(page, [SAMPLE_PRODUCT_1, SAMPLE_PRODUCT_2])
    await page.goto('/vi/products')
    await page.waitForLoadState('domcontentloaded')

    const compareBar = page.locator('.fixed.bottom-0')
    await expect(compareBar).toBeVisible({ timeout: 10_000 })

    // Button should be active with 2 items
    const compareBtn = compareBar.getByRole('link', { name: /So sánh \(2\)/i })
    await expect(compareBtn).toBeVisible({ timeout: 5_000 })
    await compareBtn.click()

    await page.waitForURL(/\/compare/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/compare/)
  })
})
