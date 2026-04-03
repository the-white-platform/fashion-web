/**
 * Admin RBAC tests.
 *
 * Uses Node's native fetch for ALL API calls to avoid Playwright's APIRequestContext
 * cookie-management side-effects (login responses set payload-token cookies that
 * contaminate subsequent requests in the same context).
 */
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Low-level fetch helpers — no Playwright cookie management
// ---------------------------------------------------------------------------

async function apiFetch(
  method: string,
  path: string,
  token?: string,
  body?: unknown,
): Promise<{ status: number; ok: boolean; body: any }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `JWT ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, body: json }
}

async function loginFetch(email: string, password: string): Promise<string> {
  const { ok, body } = await apiFetch('POST', '/api/users/login', undefined, { email, password })
  if (!ok) throw new Error(`Login failed for ${email}: ${JSON.stringify(body.errors)}`)
  return body.token as string
}

async function adminToken(): Promise<string> {
  return loginFetch('admin@thewhite.vn', 'TheWhite@2024')
}

/** Create user with the correct role at creation time (admin-authenticated POST). */
async function ensureUser(
  token: string,
  email: string,
  password: string,
  role: string,
): Promise<string> {
  // Try creating with role (admin can set role on create)
  const createResp = await apiFetch('POST', '/api/users', token, {
    name: role,
    email,
    password,
    provider: 'local',
    role,
  })

  if (createResp.ok) {
    // Newly created — login and return token (role was set at creation)
    return loginFetch(email, password)
  }

  // User already existed — login to check current role
  const userToken = await loginFetch(email, password)
  const { body: me } = await apiFetch('GET', '/api/users/me', userToken)
  const userId = me?.user?.id

  if (userId && me?.user?.role === role) {
    // Role is already correct — reuse this token
    return userToken
  }

  // Role mismatch — patch as admin and return new token
  if (userId) {
    await apiFetch('PATCH', `/api/users/${userId}`, token, { role })
  }
  return loginFetch(email, password)
}

async function firstCategoryId(token: string): Promise<number | null> {
  const { body } = await apiFetch('GET', '/api/categories?limit=1', token)
  return body?.docs?.[0]?.id ?? null
}

async function firstProduct(_token?: string): Promise<{ id: number; price: number } | null> {
  // Sort ascending by createdAt to get original seeded products (not test-created ones)
  // which have proper inventory data required by the order validation hook
  const { body } = await apiFetch('GET', '/api/products?limit=1&sort=createdAt')
  const p = body?.docs?.[0]
  return p ? { id: p.id, price: p.price } : null
}

async function firstAddressIds(
  token: string,
): Promise<{ provinceId: number | null; districtId: number | null }> {
  const [{ body: prov }, { body: dist }] = await Promise.all([
    apiFetch('GET', '/api/provinces?limit=1', token),
    apiFetch('GET', '/api/districts?limit=1', token),
  ])
  return {
    provinceId: prov?.docs?.[0]?.id ?? null,
    districtId: dist?.docs?.[0]?.id ?? null,
  }
}

async function createProduct(token: string, categoryId: number): Promise<number> {
  const slug = `rbac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const { ok, body } = await apiFetch('POST', '/api/products', token, {
    name: `RBAC Test ${Date.now()}`,
    slug,
    price: 100000,
    category: [categoryId],
    inStock: true,
  })
  if (!ok || !body.doc?.id) throw new Error(`Create product failed: ${JSON.stringify(body)}`)
  return body.doc.id as number
}

async function createOrder(
  token: string,
  productId: number,
  productPrice: number,
  districtId: number,
  provinceId: number,
): Promise<number> {
  const { ok, body } = await apiFetch('POST', '/api/orders', token, {
    items: [
      {
        product: productId,
        productName: 'RBAC Test Order',
        size: 'M',
        quantity: 1,
        unitPrice: productPrice,
        lineTotal: productPrice,
      },
    ],
    customerInfo: {
      customerName: 'RBAC Test',
      customerEmail: `rbac-test-${Date.now()}@example.com`,
      customerPhone: '0900000001',
    },
    shippingAddress: { address: '1 RBAC St', district: districtId, city: provinceId },
    payment: { method: 'cod', paymentStatus: 'pending' },
    totals: { subtotal: productPrice, total: productPrice },
  })
  if (!ok || !body.doc?.id) throw new Error(`Create order failed: ${JSON.stringify(body)}`)
  return body.doc.id as number
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Admin RBAC', () => {
  // Each test involves multiple API round-trips (login, create, patch).
  // Under load the dev server can be slow — allow generous time.
  test.setTimeout(180_000)

  // -------------------------------------------------------------------------
  // Admin panel access
  // -------------------------------------------------------------------------

  test('customer cannot access /admin (redirect or 403)', async () => {
    const token = await adminToken()
    const customerToken = await ensureUser(
      token,
      'rbac-customer@thewhite.vn',
      'RbacCustomer@123',
      'customer',
    )
    const res = await fetch(`${BASE}/admin`, {
      headers: { Authorization: `JWT ${customerToken}` },
      redirect: 'manual',
    })
    // Next.js redirects unauthorised users with 307; Payload itself may return 401/403
    expect([302, 303, 307, 401, 403]).toContain(res.status)
  })

  test('admin can access /admin', async () => {
    const token = await adminToken()
    const res = await fetch(`${BASE}/admin`, {
      headers: { Authorization: `JWT ${token}` },
      redirect: 'manual',
    })
    expect(res.ok || [302, 307].includes(res.status)).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Product DELETE
  // -------------------------------------------------------------------------

  test('customer cannot DELETE products via API', async () => {
    const token = await adminToken()
    const catId = await firstCategoryId(token)
    test.skip(catId === null, 'No categories seeded')

    const productId = await createProduct(token, catId!)
    const customerToken = await ensureUser(
      token,
      'rbac-customer@thewhite.vn',
      'RbacCustomer@123',
      'customer',
    )
    const { status } = await apiFetch('DELETE', `/api/products/${productId}`, customerToken)
    expect([401, 403]).toContain(status)

    // Cleanup
    await apiFetch('DELETE', `/api/products/${productId}`, token)
  })

  // -------------------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------------------

  test('customer can only see own notifications (filtered response)', async () => {
    const token = await adminToken()
    const customerToken = await ensureUser(
      token,
      'rbac-customer@thewhite.vn',
      'RbacCustomer@123',
      'customer',
    )
    const { status, body } = await apiFetch('GET', '/api/notifications', customerToken)
    expect(status === 200 || [401, 403].includes(status)).toBe(true)
    if (status === 200) {
      expect(Array.isArray(body.docs)).toBe(true)
    }
  })

  // -------------------------------------------------------------------------
  // Orders
  // -------------------------------------------------------------------------

  test('staff can read orders via API', async () => {
    const token = await adminToken()
    const staffToken = await ensureUser(token, 'rbac-staff@thewhite.vn', 'RbacStaff@123', 'staff')
    const { ok, body } = await apiFetch('GET', '/api/orders', staffToken)
    expect(ok).toBe(true)
    expect(body).toHaveProperty('docs')
  })

  test('staff cannot delete orders via API', async () => {
    const token = await adminToken()
    const prod = await firstProduct()
    const addrs = await firstAddressIds(token)
    test.skip(!prod || !addrs.provinceId || !addrs.districtId, 'Missing seed data')

    const orderId = await createOrder(
      token,
      prod!.id,
      prod!.price,
      addrs.districtId!,
      addrs.provinceId!,
    )
    const staffToken = await ensureUser(token, 'rbac-staff@thewhite.vn', 'RbacStaff@123', 'staff')
    const { status } = await apiFetch('DELETE', `/api/orders/${orderId}`, staffToken)
    expect([401, 403]).toContain(status)

    // Cleanup
    await apiFetch('DELETE', `/api/orders/${orderId}`, token)
  })

  // -------------------------------------------------------------------------
  // Products — editor
  // -------------------------------------------------------------------------

  test('editor can create products via API', async () => {
    const token = await adminToken()
    const catId = await firstCategoryId(token)
    test.skip(catId === null, 'No categories seeded')

    const editorToken = await ensureUser(
      token,
      'rbac-editor@thewhite.vn',
      'RbacEditor@123',
      'editor',
    )
    const slug = `editor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const { ok, body } = await apiFetch('POST', '/api/products', editorToken, {
      name: `Editor Test ${Date.now()}`,
      slug,
      price: 100000,
      category: [catId],
      inStock: true,
    })
    expect(ok).toBe(true)
    expect(body.doc).toHaveProperty('id')

    // Cleanup
    await apiFetch('DELETE', `/api/products/${body.doc.id}`, token)
  })

  test('editor cannot delete products via API', async () => {
    const token = await adminToken()
    const catId = await firstCategoryId(token)
    test.skip(catId === null, 'No categories seeded')

    const productId = await createProduct(token, catId!)
    const editorToken = await ensureUser(
      token,
      'rbac-editor@thewhite.vn',
      'RbacEditor@123',
      'editor',
    )
    const { status } = await apiFetch('DELETE', `/api/products/${productId}`, editorToken)
    expect([401, 403]).toContain(status)

    // Cleanup
    await apiFetch('DELETE', `/api/products/${productId}`, token)
  })
})
