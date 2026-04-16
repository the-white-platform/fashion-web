import { test, expect } from '@playwright/test'

const BASE =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT || process.env.PORT || '3200'}`

/**
 * Unauthenticated requests to protected API endpoints must be rejected
 * with 401 or 403.
 */
test.describe('API access — unauthenticated', () => {
  test('unauthenticated PATCH /api/users/1 → rejected', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/users/1`, {
      data: { name: 'hacked' },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('unauthenticated DELETE /api/products/1 → rejected', async ({ request }) => {
    const res = await request.delete(`${BASE}/api/products/1`)
    expect([401, 403]).toContain(res.status())
  })

  test('unauthenticated POST /api/bulk-order-status → rejected', async ({ request }) => {
    const res = await request.post(`${BASE}/api/bulk-order-status`, {
      data: { ids: [1], status: 'confirmed' },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('unauthenticated GET /api/export-csv → rejected', async ({ request }) => {
    const res = await request.get(`${BASE}/api/export-csv`)
    expect([401, 403]).toContain(res.status())
  })
})
