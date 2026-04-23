import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import configPromise from '@payload-config'

interface BirthdayRow {
  id: string | number
  name: string | null
  email: string | null
  phone: string | null
  date_of_birth: string | null
  zalo_delivery_status: string | null
  days_away: number
}

/**
 * Admin-only: list customers whose birthday falls within the next
 * `days` window (default 7, max 60). Matches on (month, day) so
 * we don't care about the birth year. Sorted by proximity.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user || user.collection !== 'users' || (user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const url = new URL(request.url)
  const windowRaw = Number.parseInt(url.searchParams.get('days') ?? '7', 10)
  const windowDays = Math.min(Math.max(Number.isFinite(windowRaw) ? windowRaw : 7, 1), 60)

  try {
    const { rows } = (await payload.db.drizzle.execute(sql`
      WITH today AS (
        SELECT (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS d
      ),
      candidates AS (
        SELECT
          u.id,
          u.name,
          u.email,
          u.phone,
          u.date_of_birth,
          u.zalo_delivery_status,
          -- Next occurrence of the birthday anniversary in VN tz.
          (
            make_date(
              EXTRACT(YEAR FROM (SELECT d FROM today))::int
                + CASE
                    WHEN make_date(
                      EXTRACT(YEAR FROM (SELECT d FROM today))::int,
                      EXTRACT(MONTH FROM u.date_of_birth)::int,
                      LEAST(EXTRACT(DAY FROM u.date_of_birth)::int, 28)
                    ) < (SELECT d FROM today) THEN 1 ELSE 0 END,
              EXTRACT(MONTH FROM u.date_of_birth)::int,
              LEAST(EXTRACT(DAY FROM u.date_of_birth)::int, 28)
            )
          ) AS next_birthday
        FROM users u
        WHERE u.date_of_birth IS NOT NULL
          AND (u.role IS NULL OR u.role = 'customer')
      )
      SELECT
        id, name, email, phone, date_of_birth, zalo_delivery_status,
        (next_birthday - (SELECT d FROM today))::int AS days_away
      FROM candidates
      WHERE (next_birthday - (SELECT d FROM today))::int BETWEEN 0 AND ${windowDays}
      ORDER BY days_away ASC, name ASC
      LIMIT 200
    `)) as unknown as { rows: BirthdayRow[] }

    return NextResponse.json({
      windowDays,
      count: rows.length,
      users: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        dateOfBirth: r.date_of_birth,
        zaloDeliveryStatus: r.zalo_delivery_status ?? 'unknown',
        daysAway: r.days_away,
      })),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: 'admin/users/upcoming-birthdays failed', err: msg })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
