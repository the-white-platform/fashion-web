import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// Run serially — login once, reuse across tests
test.describe.configure({ mode: 'serial' })

const AUTH_FILE = path.join(process.cwd(), 'e2e/.auth/admin.json')

async function saveAdminStorageState(browser: import('@playwright/test').Browser): Promise<void> {
  if (fs.existsSync(AUTH_FILE)) {
    const stat = fs.statSync(AUTH_FILE)
    if (Date.now() - stat.mtimeMs < 5 * 60 * 1000) return
  }

  const context = await browser.newContext()
  const page = await context.newPage()

  // Use browser fetch (credentials: 'include') so the cookie lands in the browser context
  await page.goto('http://localhost:3000/vi')
  await page.waitForLoadState('domcontentloaded')

  const loginResult = await page.evaluate(async () => {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: 'admin@thewhite.vn', password: 'TheWhite@2024' }),
    })
    return { ok: res.ok, status: res.status }
  })

  if (!loginResult.ok) throw new Error(`Browser login failed: ${loginResult.status}`)

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })
  await context.storageState({ path: AUTH_FILE })
  await context.close()
}

test.describe('Loyalty dashboard', () => {
  let loyaltyPage: import('@playwright/test').Page

  test.beforeAll(async ({ browser }) => {
    await saveAdminStorageState(browser)
    const context = await browser.newContext({ storageState: AUTH_FILE })
    loyaltyPage = await context.newPage()
  })

  test.afterAll(async () => {
    await loyaltyPage?.context().close()
    // Clean up auth file so next run re-authenticates
    fs.rmSync(AUTH_FILE, { force: true })
  })

  test('unauthenticated user is redirected to login when visiting loyalty page', async ({
    page: freshPage,
  }) => {
    await freshPage.goto('/vi/loyalty')
    await freshPage.waitForURL(/login/, { timeout: 10_000 })
    await expect(freshPage).toHaveURL(/login/)
  })

  test('authenticated user can access loyalty page', async () => {
    // Navigate to loyalty and wait for the page to fully render
    await loyaltyPage.goto('/vi/loyalty')
    await loyaltyPage.waitForSelector('h1:text-is("Điểm Thưởng & Hạng Thành Viên")', {
      timeout: 45_000,
    })
    await expect(loyaltyPage).toHaveURL(/loyalty/, { timeout: 5_000 })
  })

  test('loyalty page has the main heading', async () => {
    await expect(
      loyaltyPage.getByRole('heading', { name: /Điểm Thưởng & Hạng Thành Viên/i }),
    ).toBeVisible({ timeout: 5_000 })
  })

  test('loyalty page shows tier info section', async () => {
    // Wait for loading skeleton to hide (data fetched)
    await loyaltyPage
      .waitForSelector('.animate-pulse', { state: 'hidden', timeout: 30_000 })
      .catch(() => {})
    // The tier benefits heading includes the tier name — always visible after load
    await expect(loyaltyPage.getByText(/Quyền Lợi Hạng/i)).toBeVisible({ timeout: 10_000 })
  })

  test('loyalty page shows points section', async () => {
    await expect(loyaltyPage.getByText('điểm khả dụng').first()).toBeVisible({ timeout: 10_000 })
  })

  test('loyalty page shows tier benefits section', async () => {
    await expect(loyaltyPage.getByText(/Quyền Lợi Hạng/i)).toBeVisible({ timeout: 5_000 })
  })

  test('loyalty page shows how to earn points section', async () => {
    await expect(loyaltyPage.getByText('Cách Tích Điểm')).toBeVisible({ timeout: 5_000 })
  })

  test('loyalty page shows points history section', async () => {
    await expect(loyaltyPage.getByText('Lịch Sử Điểm')).toBeVisible({ timeout: 5_000 })
  })

  test('breadcrumb shows Trang chủ and Điểm Thưởng on loyalty page', async () => {
    await expect(loyaltyPage.getByRole('link', { name: 'Trang chủ' })).toBeVisible({
      timeout: 5_000,
    })
    await expect(loyaltyPage.getByText('Điểm Thưởng').first()).toBeVisible({ timeout: 5_000 })
  })
})
