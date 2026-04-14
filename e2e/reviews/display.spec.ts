import { test, expect } from '@playwright/test'

// Use a stable seeded product (ID 1 always exists after seed)
const PRODUCT_URL = '/vi/products/1'

test.describe('Reviews display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('domcontentloaded')
  })

  test('product page shows reviews section heading', async ({ page }) => {
    // Scroll to reviews section and wait for it
    const reviewsHeading = page.getByRole('heading', { name: 'Đánh Giá & Nhận Xét' })
    await reviewsHeading.scrollIntoViewIfNeeded()
    await expect(reviewsHeading).toBeVisible({ timeout: 10_000 })
  })

  test('rating filter buttons are visible (1–5 stars)', async ({ page }) => {
    const reviewsHeading = page.getByRole('heading', { name: 'Đánh Giá & Nhận Xét' })
    await reviewsHeading.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // The rating distribution area contains buttons for each star rating (1-5)
    // These are `button` elements inside the rating summary section
    const ratingSection = page.locator('.bg-muted\\/50.rounded-sm').first()
    await expect(ratingSection).toBeVisible({ timeout: 8_000 })

    // Each rating filter button shows a star number (1–5)
    for (const star of [5, 4, 3, 2, 1]) {
      const btn = ratingSection
        .getByRole('button')
        .filter({ hasText: `${star}` })
        .first()
      await expect(btn).toBeVisible({ timeout: 5_000 })
    }
  })

  test('sort options trigger (select) is visible', async ({ page }) => {
    const reviewsHeading = page.getByRole('heading', { name: 'Đánh Giá & Nhận Xét' })
    await reviewsHeading.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // The sort label "Sắp xếp:" is visible
    await expect(page.getByText('Sắp xếp:')).toBeVisible({ timeout: 8_000 })

    // The SelectTrigger (a button with role=combobox) is visible
    const sortTrigger = page.getByRole('combobox')
    await expect(sortTrigger).toBeVisible({ timeout: 8_000 })
  })

  test('sort options include Mới nhất, Hữu ích nhất, Đánh giá cao nhất', async ({ page }) => {
    const reviewsHeading = page.getByRole('heading', { name: 'Đánh Giá & Nhận Xét' })
    await reviewsHeading.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    const sortTrigger = page.getByRole('combobox')
    await expect(sortTrigger).toBeVisible({ timeout: 8_000 })
    await sortTrigger.click()

    // SelectContent with sort options
    await expect(page.getByRole('option', { name: 'Mới nhất' })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('option', { name: 'Hữu ích nhất' })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('option', { name: 'Đánh giá cao nhất' })).toBeVisible({
      timeout: 5_000,
    })
  })

  test('reviews section shows review count or empty message', async ({ page }) => {
    const reviewsHeading = page.getByRole('heading', { name: 'Đánh Giá & Nhận Xét' })
    await reviewsHeading.scrollIntoViewIfNeeded()

    // Wait for loading spinner to disappear
    await page
      .waitForSelector('.animate-spin', { state: 'hidden', timeout: 10_000 })
      .catch(() => {})

    // Either shows reviews or the empty message
    const emptyMsg = page.getByText('Chưa có đánh giá nào')
    const hasEmpty = await emptyMsg.isVisible({ timeout: 5_000 }).catch(() => false)

    if (!hasEmpty) {
      // There are reviews — the first review card should be visible
      const reviewCards = page.locator('.border.border-border.rounded-sm.p-6')
      expect(await reviewCards.count()).toBeGreaterThan(0)
    } else {
      await expect(emptyMsg).toBeVisible()
    }
  })
})
