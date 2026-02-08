import { type PayloadHandler, commitTransaction, initTransaction } from 'payload'

import { seed as seedScript } from '@/endpoints/seed'

export const seedHandler: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  // Prevent seeding in production
  if (process.env.NODE_ENV === 'production') {
    return Response.json(
      { error: 'Seeding is disabled in production environment' },
      { status: 403 },
    )
  }

  if (!user) {
    const { totalDocs } = await payload.find({
      collection: 'users',
      limit: 0,
      depth: 0,
    })

    if (totalDocs > 0) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Create a transaction so that all seeding happens in one transaction
    await initTransaction(req)

    await seedScript({ payload, req })

    // Finalise transaction
    await commitTransaction(req)

    return Response.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(message)
    return Response.json({ error: message }, { status: 500 })
  }
}
