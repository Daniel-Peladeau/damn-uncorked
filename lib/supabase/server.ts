import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // cookieStore.set() throws in Server Components (read-only context).
            // The empty catch is intentional — the Supabase SSR client handles this gracefully.
          }
        },
      },
    }
  )
}

// For helpers that take the request-scoped client as a parameter, so every
// query they run still carries the signed-in user's session (and RLS).
export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

// getUser() is a network round trip to Supabase Auth, and the layout, page,
// and query helpers each need the user. cache() shares one call across a
// single server render; outside a render (server actions, route handlers)
// it just calls through, so each of those requests still validates on its own.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
