import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user?.email) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
      }

      const { data: allowed } = await supabase
        .from('allowed_users')
        .select('email')
        .eq('email', user.email)
        .single()

      if (!allowed) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/auth/signin?error=not_allowed`)
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
}
