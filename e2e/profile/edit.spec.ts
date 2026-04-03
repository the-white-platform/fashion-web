import { test, expect } from '@playwright/test'

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/vi/login')
  await page.getByRole('textbox', { name: /email/i }).fill('admin@thewhite.vn')
  await page.getByPlaceholder('••••••••').fill('TheWhite@2024')
  await page.getByRole('button', { name: /login|đăng nhập/i }).click()
  // Wait for redirect to profile — we are already on the profile page at this point
  await page.waitForURL('**/profile**', { timeout: 30_000 })
  await page.waitForLoadState('domcontentloaded')
  // Wait for the profile content to be rendered (user context hydration)
  await page.waitForTimeout(500)
}

test.describe('Profile edit', () => {
  test.setTimeout(90_000)

  test('profile page loads with user name and email', async ({ page }) => {
    await loginAsAdmin(page)
    // Already on /vi/profile after login — no need to navigate again

    // The header card shows user name as h1
    await expect(page.locator('h1').filter({ hasText: /\w+/ }).first()).toBeVisible({
      timeout: 10_000,
    })
    // Email is visible somewhere on the page — use first() since email may appear twice
    await expect(page.getByText('admin@thewhite.vn').first()).toBeVisible({ timeout: 8_000 })
  })

  test('profile info tab is active by default', async ({ page }) => {
    await loginAsAdmin(page)

    // The info section heading is visible (Thông Tin tab content)
    await expect(page.getByRole('heading', { name: /Thông Tin/i })).toBeVisible({ timeout: 10_000 })
  })

  test('edit button toggles the edit form', async ({ page }) => {
    await loginAsAdmin(page)

    // The edit button (Pencil icon button with text "Edit" — common.edit fallback)
    const editBtn = page.getByRole('button', { name: /edit|chỉnh sửa/i })
    await expect(editBtn).toBeVisible({ timeout: 8_000 })
    await editBtn.click()

    // After clicking, the form appears — find the name input via placeholder or first text input in form
    // The label is "Họ và Tên" but it's not htmlFor-associated; use the input directly
    const nameInput = page.locator('form input[type="text"]').first()
    await expect(nameInput).toBeVisible({ timeout: 5_000 })
  })

  test('cancel button reverts edit form', async ({ page }) => {
    await loginAsAdmin(page)

    const editBtn = page.getByRole('button', { name: /edit|chỉnh sửa/i })
    await expect(editBtn).toBeVisible({ timeout: 8_000 })
    await editBtn.click()

    // Form should be open — first text input in form should be visible
    const nameInput = page.locator('form input[type="text"]').first()
    await expect(nameInput).toBeVisible({ timeout: 5_000 })

    // Click cancel
    const cancelBtn = page.getByRole('button', { name: /hủy|cancel/i })
    await cancelBtn.click()

    // Edit button should be back; form should be gone
    await expect(page.getByRole('button', { name: /edit|chỉnh sửa/i })).toBeVisible({
      timeout: 5_000,
    })
    await expect(page.locator('form input[type="text"]').first()).not.toBeVisible({
      timeout: 3_000,
    })
  })

  test('name input has the current user name pre-filled', async ({ page }) => {
    await loginAsAdmin(page)

    const editBtn = page.getByRole('button', { name: /edit|chỉnh sửa/i })
    await expect(editBtn).toBeVisible({ timeout: 8_000 })
    await editBtn.click()

    // The first text input in the form is the name field
    const nameInput = page.locator('form input[type="text"]').first()
    await expect(nameInput).toBeVisible({ timeout: 5_000 })

    const value = await nameInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test('phone input is present in edit form', async ({ page }) => {
    await loginAsAdmin(page)

    const editBtn = page.getByRole('button', { name: /edit|chỉnh sửa/i })
    await expect(editBtn).toBeVisible({ timeout: 8_000 })
    await editBtn.click()

    // Phone input has type="tel" or placeholder "0912345678"
    const phoneInput = page
      .locator('form input[type="tel"]')
      .or(page.getByPlaceholder('0912345678'))
    await expect(phoneInput).toBeVisible({ timeout: 5_000 })
  })

  test('save button is visible in edit form', async ({ page }) => {
    await loginAsAdmin(page)

    const editBtn = page.getByRole('button', { name: /edit|chỉnh sửa/i })
    await expect(editBtn).toBeVisible({ timeout: 8_000 })
    await editBtn.click()

    await expect(page.getByRole('button', { name: /lưu|save/i })).toBeVisible({ timeout: 5_000 })
  })
})
