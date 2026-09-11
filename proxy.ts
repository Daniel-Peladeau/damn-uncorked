import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // `auth(?:/|$)` excludes only the `/auth` segment and its subpaths, not
    // every path merely starting with "auth" (e.g. `/authenticate`).
    // The trailing `|$` excludes the exact root path: `$` asserts
    // end-of-string at the position right after the leading `/`, which is
    // true only when nothing follows it. All other paths are unaffected.
    '/((?!_next/static|_next/image|favicon.ico|auth(?:/|$)|$).*)',
  ],
}
