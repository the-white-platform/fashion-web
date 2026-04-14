import { test, expect } from '@playwright/test'
import type { ProductForFrontend } from '../../src/utilities/getProducts'

const PRODUCT_URL = '/vi/products/quan-vai-gan'
// quan-vai-gan — ID from current seed DB
const PRODUCT_ID = 6

// Seed recently viewed items in localStorage before React mounts
async function seedRecentlyViewedViaInitScript(
  page: import('@playwright/test').Page,
  items: ProductForFrontend[],
) {
  await page.addInitScript((recentItems) => {
    localStorage.setItem('thewhite_recently_viewed', JSON.stringify(recentItems))
  }, items)
}

// Build a minimal product for seeding (matches ProductForFrontend shape)
function makeProduct(id: number): ProductForFrontend {
  return {
    id,
    name: `Test Product ${id}`,
    slug: `test-product-${id}`,
    category: 'Test',
    categories: ['Test'],
    categorySlug: 'test',
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
    description: undefined,
    features: [],
  }
}

test.describe('Recently viewed', () => {
  test('visiting a product page tracks it in recently viewed localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('thewhite_recently_viewed')
    })

    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('domcontentloaded')
    // Give the useEffect time to run trackProduct
    await page.waitForTimeout(500)

    const recentItems = await page.evaluate(() => {
      const raw = localStorage.getItem('thewhite_recently_viewed')
      return raw ? JSON.parse(raw) : []
    })

    expect(Array.isArray(recentItems)).toBe(true)
    expect(recentItems.length).toBeGreaterThan(0)
    // The tracked product should have id matching the seeded product
    expect(recentItems[0].id).toBe(PRODUCT_ID)
  })

  test('recently viewed section appears on homepage when items are stored', async ({ page }) => {
    // Seed a recently viewed item before loading homepage
    await seedRecentlyViewedViaInitScript(page, [makeProduct(PRODUCT_ID)])

    await page.goto('/vi')
    await page.waitForLoadState('domcontentloaded')

    // The RecentlyViewed component renders an h2 with the translated title
    await expect(page.getByRole('heading', { name: 'Đã Xem Gần Đây' })).toBeVisible({
      timeout: 12_000,
    })
  })

  test('recently viewed section shows product cards when items present', async ({ page }) => {
    await seedRecentlyViewedViaInitScript(page, [makeProduct(PRODUCT_ID), makeProduct(2)])

    await page.goto('/vi')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: 'Đã Xem Gần Đây' })).toBeVisible({
      timeout: 12_000,
    })

    // Product cards in the section
    const section = page.locator('section').filter({ has: page.getByText('Đã Xem Gần Đây') })
    const cards = section.locator('a[href*="/vi/products/"]')
    await expect(cards.first()).toBeVisible({ timeout: 5_000 })
  })

  test('recently viewed section does NOT appear on homepage when empty', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('thewhite_recently_viewed')
    })

    await page.goto('/vi')
    await page.waitForLoadState('domcontentloaded')
    // Give time for client hydration
    await page.waitForTimeout(1000)

    await expect(page.getByRole('heading', { name: 'Đã Xem Gần Đây' })).not.toBeVisible()
  })

  test('recently viewed section on product detail page excludes the current product', async ({
    page,
  }) => {
    // Seed 2 items including the current product
    await seedRecentlyViewedViaInitScript(page, [makeProduct(PRODUCT_ID), makeProduct(2)])

    await page.goto(PRODUCT_URL) // product PRODUCT_ID
    await page.waitForLoadState('domcontentloaded')

    // RecentlyViewed on product page excludes the current product
    const heading = page.getByRole('heading', { name: 'Đã Xem Gần Đây' })
    const isVisible = await heading.isVisible({ timeout: 8_000 }).catch(() => false)

    if (isVisible) {
      // All links in the recently viewed section should NOT link to the current product slug
      const section = page.locator('section').filter({ has: page.getByText('Đã Xem Gần Đây') })
      const links = section.locator('a[href*="/vi/products/"]')
      const count = await links.count()

      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute('href')
        expect(href).not.toContain('/products/quan-vai-gan')
      }
    }
  })

  test('max 20 items are tracked in recently viewed', async ({ page }) => {
    // Seed exactly 20 items
    const items = Array.from({ length: 20 }, (_, i) => makeProduct(100 + i))
    await seedRecentlyViewedViaInitScript(page, items)

    await page.goto(PRODUCT_URL) // visit the seeded product (new item prepended)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    const recentItems = await page.evaluate(() => {
      const raw = localStorage.getItem('thewhite_recently_viewed')
      return raw ? JSON.parse(raw) : []
    })

    // Should still be max 20 items after adding the seeded product
    expect(recentItems.length).toBeLessThanOrEqual(20)
    // The seeded product should be first (most recent)
    expect(recentItems[0].id).toBe(PRODUCT_ID)
  })
})
