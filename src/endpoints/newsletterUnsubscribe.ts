import type { PayloadHandler } from 'payload'

export const newsletterUnsubscribeHandler: PayloadHandler = async (req) => {
  let body: { token?: unknown }
  try {
    body = (await req.json?.()) ?? {}
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const token = body.token
  if (!token || typeof token !== 'string') {
    return Response.json({ error: 'token is required' }, { status: 400 })
  }

  const { payload } = req

  const result = await payload.find({
    collection: 'newsletter-subscribers',
    where: { unsubscribeToken: { equals: token } },
    limit: 1,
  })

  const subscriber = result.docs[0]
  if (!subscriber) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 404 })
  }

  if (subscriber.status === 'unsubscribed') {
    return Response.json({ message: 'Already unsubscribed' }, { status: 200 })
  }

  await payload.update({
    collection: 'newsletter-subscribers',
    id: subscriber.id,
    data: {
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
    },
  })

  return Response.json({ message: 'Successfully unsubscribed' }, { status: 200 })
}
