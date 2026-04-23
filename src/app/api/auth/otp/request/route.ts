import { NextResponse } from 'next/server'

// OTP login/reset flow is disabled. Users sign in with password
// or social login (Google / Facebook / Zalo). Kept as a 410 stub
// so stale clients get a clear error instead of a silent hang.
export async function POST() {
  return NextResponse.json(
    { error: 'OTP login is disabled. Use password or social login.' },
    { status: 410 },
  )
}
