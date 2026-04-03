import { test as base, expect } from '@playwright/test'
import { loginViaAPI } from '../helpers/api'

type AuthFixtures = {
  adminToken: string
  customerToken: string
  authenticatedPage: ReturnType<(typeof base)['extend']>
}

export const test = base.extend<AuthFixtures>({
  adminToken: async ({ request }, use) => {
    const token = await loginViaAPI(request, 'admin@thewhite.vn', 'TheWhite@2024')
    await use(token)
  },
  customerToken: async ({ request }, use) => {
    try {
      const token = await loginViaAPI(request, 'test-customer@thewhite.vn', 'TestPass@123')
      await use(token)
    } catch {
      // Customer may not exist yet — tests that need it should seed first
      await use('')
    }
  },
})

export { expect }
