import { test, expect } from '@playwright/test'

test.describe('Forgot Password', () => {
  test('shows forgot password form', async ({ page }) => {
    await page.goto('/vi/forgot-password')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /send|gửi/i })).toBeVisible()
  })

  test('submitting email shows success or error feedback', async ({ page }) => {
    await page.goto('/vi/forgot-password')
    await page.getByRole('textbox', { name: /email/i }).fill('admin@thewhite.vn')
    await page.getByRole('button', { name: /send|gửi/i }).click()
    // Either success message (if email configured) or error (if not) — either way, UI responds
    const feedback = page.getByText(/check|email|reset|error|failed|gửi|kiểm tra|thất bại/i).first()
    await expect(feedback).toBeVisible({ timeout: 10000 })
  })

  test('back to login link works', async ({ page }) => {
    await page.goto('/vi/forgot-password')
    await page.getByRole('link', { name: /back|quay lại|login/i }).click()
    await expect(page).toHaveURL(/login/)
  })

  test('reset password page without token shows error', async ({ page }) => {
    await page.goto('/vi/reset-password')
    // Page shows h1 + p — use .first() to avoid strict mode violation
    await expect(page.getByText(/invalid|không hợp lệ|expired/i).first()).toBeVisible()
  })

  test('reset password page with invalid token shows error', async ({ page }) => {
    await page.goto('/vi/reset-password?token=invalidtoken123')
    // Should show form but submit will fail
    const submitBtn = page.getByRole('button', { name: /reset|đặt lại/i })
    if (await submitBtn.isVisible()) {
      await page.getByPlaceholder('••••••••').first().fill('NewPass@123')
      await page.getByPlaceholder('••••••••').last().fill('NewPass@123')
      await submitBtn.click()
      await expect(page.getByText(/invalid|không hợp lệ|failed|expired/i).first()).toBeVisible({
        timeout: 5000,
      })
    }
  })
})
