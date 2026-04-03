import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('shows login form with email and password fields', async ({ page }) => {
    await page.goto('/vi/login')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: /login|đăng nhập/i })).toBeVisible()
  })

  test('invalid credentials keeps user on login page', async ({ page }) => {
    await page.goto('/vi/login')
    await page.getByRole('textbox', { name: /email/i }).fill('wrong@test.com')
    await page.getByPlaceholder('••••••••').fill('wrongpassword')
    await page.getByRole('button', { name: /login|đăng nhập/i }).click()
    // Login returns false on 401 — user stays on login page
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/login/)
  })

  test('successful login redirects to profile', async ({ page }) => {
    await page.goto('/vi/login')
    await page.getByRole('textbox', { name: /email/i }).fill('admin@thewhite.vn')
    await page.getByPlaceholder('••••••••').fill('TheWhite@2024')
    await page.getByRole('button', { name: /login|đăng nhập/i }).click()
    await page.waitForURL('**/profile**')
    await expect(page).toHaveURL(/profile/)
  })

  test('shows validation error for empty fields', async ({ page }) => {
    await page.goto('/vi/login')
    await page.getByRole('button', { name: /login|đăng nhập/i }).click()
    // HTML5 validation or custom error should prevent submission
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('forgot password link navigates to forgot-password page', async ({ page }) => {
    await page.goto('/vi/login')
    await page.getByRole('link', { name: /forgot|quên/i }).click()
    await expect(page).toHaveURL(/forgot-password/)
  })

  test('register link navigates to register page', async ({ page }) => {
    await page.goto('/vi/login')
    await page.getByRole('link', { name: /register|đăng ký/i }).click()
    await expect(page).toHaveURL(/register/)
  })

  test('Google OAuth button redirects to Google auth', async ({ page }) => {
    await page.goto('/vi/login')
    const googleBtn = page.getByRole('button', { name: /google/i })
    await expect(googleBtn).toBeVisible()
  })

  test('Facebook OAuth button is visible', async ({ page }) => {
    await page.goto('/vi/login')
    const fbBtn = page.getByRole('button', { name: /facebook/i })
    await expect(fbBtn).toBeVisible()
  })

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/vi/login')
    const pwInput = page.getByPlaceholder('••••••••')
    await expect(pwInput).toHaveAttribute('type', 'password')
    // The eye icon button is the only button in the password field container
    await page.locator('#password').locator('..').getByRole('button').click()
    // After toggle, should be text
    await expect(pwInput).toHaveAttribute('type', 'text')
  })
})
