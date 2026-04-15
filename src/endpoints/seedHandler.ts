import { type PayloadHandler, commitTransaction, initTransaction } from 'payload'
import { pushDevSchema } from '@payloadcms/drizzle'

import { seed as seedScript } from '@/endpoints/seed'

export const seedHandler: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  // One-off bootstrap: if SEED_BOOTSTRAP_TOKEN is set on the server AND the
  // caller supplies the same value via `x-seed-bootstrap` header, skip every
  // other gate. Used to seed a freshly-wiped prod DB that has no admin user
  // yet. Unset SEED_BOOTSTRAP_TOKEN immediately after use.
  const bootstrapTokenServer = process.env.SEED_BOOTSTRAP_TOKEN
  const bootstrapTokenClient = req.headers.get('x-seed-bootstrap')
  const isBootstrap =
    typeof bootstrapTokenServer === 'string' &&
    bootstrapTokenServer.length >= 32 &&
    bootstrapTokenClient === bootstrapTokenServer

  if (!isBootstrap) {
    // Prevent seeding in production
    if (process.env.NODE_ENV === 'production') {
      return Response.json(
        { error: 'Seeding is disabled in production environment' },
        { status: 403 },
      )
    }

    // Require explicit opt-in via environment variable
    if (process.env.ALLOW_SEED_ENDPOINT !== 'true') {
      return Response.json(
        { error: 'Seed endpoint disabled. Set ALLOW_SEED_ENDPOINT=true to enable.' },
        { status: 403 },
      )
    }

    // Require an authenticated admin user — no unauthenticated bypass
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin role required' }, { status: 403 })
    }
  }

  try {
    // Bootstrap path: the prod DB may be empty (no tables yet) because the
    // Drizzle adapter only pushes schema when NODE_ENV !== 'production'. Force
    // a schema push against the connected DB so the subsequent clear/create
    // calls have tables to operate on. Safe to re-run — Drizzle short-circuits
    // when the schema already matches.
    if (isBootstrap) {
      payload.logger.info('[seed] bootstrap: pushing Drizzle schema before seeding')
      // The postgres adapter is a DrizzleAdapter at runtime.
      await pushDevSchema(payload.db as unknown as Parameters<typeof pushDevSchema>[0])
    }

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
