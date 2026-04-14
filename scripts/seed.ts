import { existsSync, readFileSync } from 'fs'
import path from 'path'

// Minimal .env loader, runs BEFORE any dynamic imports below so `@payload-config`
// reads the right PAYLOAD_SECRET / DATABASE_URI. Mirrors Next.js precedence:
// `.env.local` wins over `.env`; earlier-loaded keys win.
function loadEnvFile(file: string): void {
  if (!existsSync(file)) return
  const content = readFileSync(file, 'utf-8')
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

const cwd = process.cwd()
loadEnvFile(path.join(cwd, '.env.local'))
loadEnvFile(path.join(cwd, '.env'))

async function main() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')
  const { seed: seedScript } = await import('@/endpoints/seed')

  const payload = await getPayload({ config })
  await seedScript({ payload, req: { payload } as never })
  console.log('✓ Seed complete')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
