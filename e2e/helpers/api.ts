import { APIRequestContext } from '@playwright/test'

const BASE =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT || process.env.PORT || '3000'}`

export async function loginViaAPI(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${BASE}/api/users/login`, {
    data: { email, password },
  })
  const body = await res.json()
  if (!res.ok()) throw new Error(`Login failed: ${body.errors?.[0]?.message}`)
  return body.token as string
}

export async function createUserViaAPI(
  request: APIRequestContext,
  data: { name: string; email: string; password: string; role?: string },
) {
  const res = await request.post(`${BASE}/api/users`, {
    data: { ...data, provider: 'local' },
  })
  const body = await res.json()
  if (!res.ok() && res.status() !== 409) {
    throw new Error(`Create user failed: ${JSON.stringify(body.errors)}`)
  }
  return body.doc
}

export async function setUserRole(
  request: APIRequestContext,
  token: string,
  userId: number,
  role: string,
) {
  const res = await request.patch(`${BASE}/api/users/${userId}`, {
    data: { role },
    headers: { Authorization: `JWT ${token}` },
  })
  if (!res.ok()) throw new Error(`Set role failed`)
}

export async function fetchAPI(request: APIRequestContext, path: string, token?: string) {
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `JWT ${token}`
  return request.get(`${BASE}${path}`, { headers })
}

export async function createProduct(
  request: APIRequestContext,
  token: string,
  data: Record<string, unknown>,
) {
  const res = await request.post(`${BASE}/api/products`, {
    data,
    headers: { Authorization: `JWT ${token}` },
  })
  const body = await res.json()
  if (!res.ok()) throw new Error(`Create product failed: ${JSON.stringify(body.errors)}`)
  return body.doc
}

export async function createOrder(
  request: APIRequestContext,
  token: string,
  data: Record<string, unknown>,
) {
  const res = await request.post(`${BASE}/api/orders`, {
    data,
    headers: { Authorization: `JWT ${token}` },
  })
  const body = await res.json()
  if (!res.ok()) throw new Error(`Create order failed: ${JSON.stringify(body.errors)}`)
  return body.doc
}

export async function deleteViaAPI(
  request: APIRequestContext,
  token: string,
  collection: string,
  id: number,
) {
  await request.delete(`${BASE}/api/${collection}/${id}`, {
    headers: { Authorization: `JWT ${token}` },
  })
}
