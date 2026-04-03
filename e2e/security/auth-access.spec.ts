import { test, expect } from '@playwright/test'

/**
 * Protected routes behaviour for unauthenticated users.
 *
 * - /vi/profile and /vi/loyalty use useUser() + router.push('/login') →
 *   client-side redirect fires after JS hydration.
 * - /vi/orders does NOT redirect; it renders an empty "Chưa Có Đơn Hàng" state
 *   because the page skips fetching when no user is present.
 */
test.describe('Auth-protected route access', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // ensure no auth state

  test('unauthenticated GET /vi/profile → redirects to login', async ({ page }) => {
    await page.goto('/vi/profile')
    await page.waitForURL(/login/, { timeout: 15_000 })
    expect(page.url()).toMatch(/login/)
  })

  test('unauthenticated GET /vi/loyalty → redirects to login', async ({ page }) => {
    await page.goto('/vi/loyalty')
    // Client-side redirect fires after React hydration — wait for network idle
    // before asserting URL change, then allow extra time for the router.push
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForURL(/login/, { timeout: 25_000 })
    expect(page.url()).toMatch(/login/)
  })

  test('unauthenticated GET /vi/orders → shows empty orders state (no redirect)', async ({
    page,
  }) => {
    await page.goto('/vi/orders')
    await page.waitForLoadState('domcontentloaded')

    // The page renders without redirect — shows "Chưa Có Đơn Hàng" empty state
    // (orders/page.tsx skips fetching when user is null but does not push to /login)
    const emptyState = page.getByText(/Chưa Có Đơn Hàng|No Orders/i)
    await expect(emptyState.first()).toBeVisible({ timeout: 15_000 })
    // Must still be on the orders page
    expect(page.url()).toMatch(/orders/)
  })
})
