import { test, expect } from '@playwright/test'

test.describe('Orders history page', () => {
  test('orders page shows h1 title', async ({ page }) => {
    await page.goto('/vi/orders')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Đơn Hàng Của Tôi' })).toBeVisible({
      timeout: 10_000,
    })
  })

  test('unauthenticated user sees empty orders state', async ({ page }) => {
    await page.goto('/vi/orders')
    await page.waitForLoadState('networkidle')
    // isLoading is !!user → false when no user; empty state renders immediately
    await expect(page.getByRole('heading', { name: 'Chưa Có Đơn Hàng' })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText('Khám Phá Sản Phẩm')).toBeVisible()
  })

  test('explore products button navigates to products page', async ({ page }) => {
    await page.goto('/vi/orders')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Chưa Có Đơn Hàng' })).toBeVisible({
      timeout: 10_000,
    })
    await page.getByText('Khám Phá Sản Phẩm').click()
    await expect(page).toHaveURL(/\/products/, { timeout: 15_000 })
  })

  test('breadcrumb shows home and orders links', async ({ page }) => {
    await page.goto('/vi/orders')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('link', { name: 'Trang Chủ' })).toBeVisible({ timeout: 10_000 })
    // Breadcrumb page (not a link) shows orders title
    await expect(
      page.locator('[data-slot="breadcrumb-page"]', { hasText: 'Đơn Hàng Của Tôi' }),
    ).toBeVisible()
  })

  test('subtitle text is visible on orders page', async ({ page }) => {
    await page.goto('/vi/orders')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Theo dõi và quản lý đơn hàng của bạn')).toBeVisible({
      timeout: 10_000,
    })
  })

  test('authenticated user sees orders list or empty state', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/vi/login', { timeout: 30_000 })
    await page.waitForLoadState('domcontentloaded')

    const emailInput = page.getByRole('textbox', { name: /email/i })
    await expect(emailInput).toBeVisible({ timeout: 15_000 })
    await emailInput.fill('admin@thewhite.vn')
    await page.getByPlaceholder('••••••••').fill('TheWhite@2024')
    await page.getByRole('button', { name: /login|đăng nhập/i }).click()

    // Wait for redirect after login — may go to profile or home
    await page.waitForURL(/\/(profile|vi|en)/, { timeout: 30_000 }).catch(() => {})

    await page.goto('/vi/orders', { timeout: 30_000 })
    await page.waitForLoadState('domcontentloaded')

    // Page must show the main heading
    await expect(page.getByRole('heading', { name: 'Đơn Hàng Của Tôi' })).toBeVisible({
      timeout: 20_000,
    })

    // Either orders list or empty state — both are valid
    const hasOrders = (await page.locator('.space-y-6 > *').count()) > 0
    const hasEmpty = await page
      .getByRole('heading', { name: 'Chưa Có Đơn Hàng' })
      .isVisible()
      .catch(() => false)
    expect(hasOrders || hasEmpty).toBe(true)
  })
})
