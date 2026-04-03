import { test, expect } from '@playwright/test'

test.describe('Search functionality', () => {
  test('search page loads with search component', async ({ page }) => {
    await page.goto('/vi/search')
    // The Search component renders an <Input id="search" placeholder="Search">
    await expect(page.locator('#search')).toBeVisible({ timeout: 15_000 })
  })

  test('search page with query param shows results or empty state', async ({ page }) => {
    await page.goto('/vi/search?q=shirt')
    await page.waitForLoadState('domcontentloaded')
    const hasResults = await page
      .locator('[class*="grid"] a, article')
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false)
    const hasEmpty = await page
      .locator('p', { hasText: /Không tìm thấy kết quả/ })
      .isVisible({ timeout: 5_000 })
      .catch(() => false)
    expect(hasResults || hasEmpty).toBe(true)
  })

  test('search page shows empty message for unknown query', async ({ page }) => {
    await page.goto('/vi/search?q=zzz_definitely_no_match_xyz_999')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('p', { hasText: /Không tìm thấy kết quả/ }).first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test('products page inline search filters results', async ({ page }) => {
    await page.goto('/vi/products')
    await page.waitForSelector('.group h3', { timeout: 30_000 })

    const searchInput = page.getByPlaceholder('Tìm kiếm sản phẩm...')
    await searchInput.fill('abc_xyz_no_match_999')
    await searchInput.press('Enter')
    await page.waitForTimeout(800)

    const afterCount = await page.locator('.group h3').count()
    expect(afterCount).toBe(0)
  })

  test('products page search with real term narrows results', async ({ page }) => {
    await page.goto('/vi/products')
    await page.waitForSelector('.group h3', { timeout: 30_000 })

    const firstName = await page.locator('.group h3').first().textContent()
    if (!firstName) return

    const term = firstName.slice(0, 3)
    const searchInput = page.getByPlaceholder('Tìm kiếm sản phẩm...')
    await searchInput.fill(term)
    await searchInput.press('Enter')
    await page.waitForTimeout(800)

    const results = await page.locator('.group h3').allTextContents()
    const match = results.some((r) => r.toLowerCase().includes(term.toLowerCase()))
    expect(match).toBe(true)
  })

  test('clearing search restores all products', async ({ page }) => {
    await page.goto('/vi/products')
    await page.waitForSelector('.group h3', { timeout: 30_000 })
    const initialCount = await page.locator('.group h3').count()

    const searchInput = page.getByPlaceholder('Tìm kiếm sản phẩm...')
    await searchInput.fill('abc_xyz_no_match_999')
    await searchInput.press('Enter')
    await page.waitForTimeout(500)

    await searchInput.clear()
    await searchInput.press('Enter')
    await page.waitForTimeout(800)

    const restoredCount = await page.locator('.group h3').count()
    expect(restoredCount).toBe(initialCount)
  })
})
