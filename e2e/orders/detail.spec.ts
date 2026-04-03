import { test, expect } from '@playwright/test'

test.describe('Order detail page', () => {
  test('visiting an unknown order number shows not-found state', async ({ page }) => {
    await page.goto('/vi/orders/ORDER-DOES-NOT-EXIST-XYZ')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Không Tìm Thấy Đơn Hàng' })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText('Quay Lại Danh Sách Đơn Hàng')).toBeVisible()
  })

  test('not-found state back button navigates to orders list', async ({ page }) => {
    await page.goto('/vi/orders/ORDER-DOES-NOT-EXIST-XYZ')
    await expect(page.getByRole('heading', { name: 'Không Tìm Thấy Đơn Hàng' })).toBeVisible({
      timeout: 10_000,
    })
    await page.getByText('Quay Lại Danh Sách Đơn Hàng').click()
    await expect(page).toHaveURL(/\/orders$/, { timeout: 5_000 })
  })

  test('order detail page with real order shows correct structure', async ({ page }) => {
    // Log in
    await page.goto('/vi/login')
    await page.getByRole('textbox', { name: /email/i }).fill('admin@thewhite.vn')
    await page.getByPlaceholder('••••••••').fill('TheWhite@2024')
    await page.getByRole('button', { name: /login|đăng nhập/i }).click()
    await page.waitForURL('**/profile**', { timeout: 15_000 })

    await page.goto('/vi/orders')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Đang tải đơn hàng...')).not.toBeVisible({ timeout: 15_000 })

    const viewDetailsBtns = page.getByText('Xem Chi Tiết')
    const hasOrders = await viewDetailsBtns
      .first()
      .isVisible()
      .catch(() => false)

    if (!hasOrders) {
      // No orders yet — verify empty state
      await expect(page.getByRole('heading', { name: 'Chưa Có Đơn Hàng' })).toBeVisible()
      return
    }

    await viewDetailsBtns.first().click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/orders\//, { timeout: 10_000 })

    // h1 with order number
    await expect(page.locator('h1').first()).toBeVisible()
    // Products section
    await expect(page.getByRole('heading', { name: 'Sản Phẩm' })).toBeVisible()
    // Progress section
    await expect(page.getByText('Tiến Trình Đơn Hàng')).toBeVisible()
    // Summary section
    await expect(page.getByText('Tổng Kết')).toBeVisible()
  })

  test('order detail breadcrumb has orders link', async ({ page }) => {
    await page.goto('/vi/login')
    await page.getByRole('textbox', { name: /email/i }).fill('admin@thewhite.vn')
    await page.getByPlaceholder('••••••••').fill('TheWhite@2024')
    await page.getByRole('button', { name: /login|đăng nhập/i }).click()
    await page.waitForURL('**/profile**', { timeout: 15_000 })

    await page.goto('/vi/orders')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Đang tải đơn hàng...')).not.toBeVisible({ timeout: 15_000 })

    const viewDetailsBtns = page.getByText('Xem Chi Tiết')
    if (
      !(await viewDetailsBtns
        .first()
        .isVisible()
        .catch(() => false))
    )
      return

    await viewDetailsBtns.first().click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('link', { name: 'Đơn Hàng Của Tôi' })).toBeVisible({
      timeout: 8_000,
    })
  })

  test('order detail page shows status badge', async ({ page }) => {
    await page.goto('/vi/login')
    await page.getByRole('textbox', { name: /email/i }).fill('admin@thewhite.vn')
    await page.getByPlaceholder('••••••••').fill('TheWhite@2024')
    await page.getByRole('button', { name: /login|đăng nhập/i }).click()
    await page.waitForURL('**/profile**', { timeout: 15_000 })

    await page.goto('/vi/orders')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Đang tải đơn hàng...')).not.toBeVisible({ timeout: 15_000 })

    const viewDetailsBtns = page.getByText('Xem Chi Tiết')
    if (
      !(await viewDetailsBtns
        .first()
        .isVisible()
        .catch(() => false))
    )
      return

    await viewDetailsBtns.first().click()
    await page.waitForLoadState('networkidle')

    const statusTexts = ['Đang Xử Lý', 'Đã Xác Nhận', 'Đang Giao', 'Đã Giao', 'Đã Hủy']
    let found = false
    for (const text of statusTexts) {
      if (
        await page
          .getByText(text)
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })
})
