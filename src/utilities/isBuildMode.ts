/**
 * Determines if the application is running in build mode.
 * During Docker/CI builds, the database may not be available, so we skip
 * database queries that would otherwise fail.
 *
 * @returns true if running in build mode (no real database available)
 */
export function isBuildMode(): boolean {
  const phase = process.env.NEXT_PHASE
  const databaseUri = process.env.DATABASE_URI || ''

  return (
    phase === 'phase-production-build' ||
    databaseUri.includes('dummy') ||
    databaseUri.includes('localhost')
  )
}
