import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user?.email) {
      const { data: allowed, error: allowlistError } = await supabase
        .from('allowed_users')
        .select('email')
        .eq('email', user.email)
        .single()

      if (allowlistError && allowlistError.code !== 'PGRST116') {
        // Fail closed: exchangeCodeForSession already set the session cookies,
        // and proxy.ts only checks for a signed-in user, so an unverified
        // session must not survive a failed allowlist lookup. Local scope: this
        // can also hit an allowlisted user during a DB blip, and shouldn't
        // sign them out of their other devices.
        await supabase.auth.signOut({ scope: 'local' })
        return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
      }

      if (!allowed) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/auth/signin?error=not_allowed`)
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
}
