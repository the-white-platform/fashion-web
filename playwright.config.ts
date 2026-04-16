import { defineConfig, devices } from '@playwright/test'

// Allow the port to be overridden at runtime (e.g. when 3200 is occupied by
// another dev server on the same machine). Defaults to 3200.
const PORT = process.env.PLAYWRIGHT_PORT || process.env.PORT || '3200'
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    locale: 'vi-VN',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `cross-env PORT=${PORT} pnpm dev`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
