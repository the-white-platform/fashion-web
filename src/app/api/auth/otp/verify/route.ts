import { NextResponse } from 'next/server'

// OTP login/reset flow is disabled — see ../request/route.ts.
export async function POST() {
  return NextResponse.json(
    { error: 'OTP login is disabled. Use password or social login.' },
    { status: 410 },
  )
}
