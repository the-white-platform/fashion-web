import { test, expect } from '@playwright/test'

test.describe('Register', () => {
  const uniqueEmail = () => `test-${Date.now()}@thewhite.vn`

  test('shows registration form', async ({ page }) => {
    await page.goto('/vi/register')
    await expect(page.getByRole('textbox', { name: /name|tên/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /register|đăng ký/i })).toBeVisible()
  })

  test('successful registration auto-logs in and redirects', async ({ page }) => {
    const email = uniqueEmail()
    await page.goto('/vi/register')
    await page.getByRole('textbox', { name: /name|tên/i }).fill('Test User')
    await page.getByRole('textbox', { name: /email/i }).fill(email)
    await page.locator('input[name="phone"]').fill('0912345678')
    await page.locator('input[name="password"]').fill('TestPass@123')
    await page.locator('input[name="confirmPassword"]').fill('TestPass@123')
    await page.locator('#terms').check()
    await page.getByRole('button', { name: /register|đăng ký/i }).click()
    await page.waitForURL('**/profile**', { timeout: 15000 })
    await expect(page).toHaveURL(/profile/)
  })

  test('duplicate email shows error', async ({ page }) => {
    await page.goto('/vi/register')
    await page.getByRole('textbox', { name: /name|tên/i }).fill('Test Dup')
    await page.getByRole('textbox', { name: /email/i }).fill('admin@thewhite.vn')
    await page.locator('input[name="phone"]').fill('0912345678')
    await page.locator('input[name="password"]').fill('TestPass@123')
    await page.locator('input[name="confirmPassword"]').fill('TestPass@123')
    await page.locator('#terms').check()
    await page.getByRole('button', { name: /register|đăng ký/i }).click()
    // registerFailed: "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại."
    await expect(page.getByText(/thất bại|đăng ký thất bại|registration failed/i)).toBeVisible({
      timeout: 8000,
    })
  })

  test('short password shows error', async ({ page }) => {
    await page.goto('/vi/register')
    await page.getByRole('textbox', { name: /name|tên/i }).fill('Test Short')
    await page.getByRole('textbox', { name: /email/i }).fill(uniqueEmail())
    await page.locator('input[name="phone"]').fill('0912345678')
    await page.locator('input[name="password"]').fill('short')
    await page.locator('input[name="confirmPassword"]').fill('short')
    await page.locator('#terms').check()
    await page.getByRole('button', { name: /register|đăng ký/i }).click()
    // passwordMinLength: "Mật khẩu phải có ít nhất 8 ký tự"
    await expect(page.getByText(/ít nhất 8|mật khẩu phải|password.*8/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test('referral code param shows referral banner', async ({ page }) => {
    await page.goto('/vi/register?ref=TW-TESTCODE')
    await expect(page.getByText(/refer|giới thiệu|10%/i)).toBeVisible()
  })

  test('login link navigates to login page', async ({ page }) => {
    await page.goto('/vi/register')
    // Use the form's login link specifically (not the nav link)
    await page
      .locator('form')
      .getByRole('link', { name: /login|đăng nhập/i })
      .click()
    await expect(page).toHaveURL(/login/)
  })
})
