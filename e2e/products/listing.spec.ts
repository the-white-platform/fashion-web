import { test, expect } from '@playwright/test'

test.describe('Products listing page', () => {
  // The products listing page is SSR-heavy; allow more time per test
  test.setTimeout(90_000)

  test.beforeEach(async ({ page }) => {
    await page.goto('/vi/products', { timeout: 60_000 })
    // Wait for client-side hydration — products grid renders client-side
    await page.waitForSelector('.group h3', { timeout: 40_000 })
  })

  test('page loads with heading and product cards', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Sản Phẩm/i })).toBeVisible({
      timeout: 10_000,
    })
    const cards = page.locator('.group h3')
    await expect(cards.first()).toBeVisible()
  })

  test('product cards show name, price and image', async ({ page }) => {
    // ProductCard structure: motion.div.group > Link(a) > img + h3
    // beforeEach already confirmed .group h3 is visible; use the link within the card
    const firstCardLink = page.locator('a[href*="/vi/products/"]').first()
    await expect(firstCardLink).toBeVisible({ timeout: 15_000 })
    await expect(firstCardLink.locator('h3')).toBeVisible({ timeout: 10_000 })
    // Price is the bold div at the bottom of the card info section
    const priceLocator = firstCardLink.locator('div.font-bold.text-foreground')
    await expect(priceLocator).toBeVisible({ timeout: 5_000 })
    await expect(firstCardLink.locator('img').first()).toBeVisible({ timeout: 5_000 })
  })

  test('search input filters products', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Tìm kiếm sản phẩm...')
    await expect(searchInput).toBeVisible({ timeout: 10_000 })
    await searchInput.fill('zzz_no_match_xyz')
    await searchInput.press('Enter')
    await page.waitForTimeout(800)
    const count = await page.locator('.group h3').count()
    expect(count).toBe(0)
  })

  test('sort dropdown is present and functional', async ({ page }) => {
    const sortSelect = page.locator('select')
    await expect(sortSelect).toBeVisible({ timeout: 10_000 })
    await sortSelect.selectOption('price-low')
    await page.waitForTimeout(300)
    await page.waitForSelector('.group h3', { timeout: 10_000 })
  })

  test('filter sidebar shows Bộ Lọc heading on desktop', async ({ page }) => {
    // Desktop sidebar has h2 with Bộ Lọc
    await expect(page.locator('aside h2', { hasText: 'Bộ Lọc' })).toBeVisible({ timeout: 10_000 })
  })

  test('category filter buttons are visible', async ({ page }) => {
    // "Tất Cả" is the default category button in the sidebar
    await expect(page.locator('aside').getByText('Tất Cả')).toBeVisible({ timeout: 10_000 })
  })

  test('clicking a product card navigates to detail page', async ({ page }) => {
    await page.waitForSelector('a[href*="/vi/products/"]', { timeout: 10_000 })
    const firstLink = page.locator('a[href*="/vi/products/"]').first()
    const href = await firstLink.getAttribute('href')
    await firstLink.click()
    await page.waitForURL(`**${href}**`, { timeout: 15_000 })
    await expect(page).toHaveURL(/\/products\//)
  })

  test('breadcrumb shows Trang chủ and Sản phẩm', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Trang chủ' })).toBeVisible({ timeout: 10_000 })
    await expect(
      page
        .getByRole('link', { name: 'Sản phẩm' })
        .or(page.locator('[data-slot="breadcrumb-page"]', { hasText: 'Sản phẩm' })),
    ).toBeVisible()
  })
})
