import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchNominatimCandidates } from '@/lib/geocoding'

// Proxies the Add Wine form's live location search (GitHub issue #68) to
// Nominatim server-side — the browser's fetch() can't set a custom
// User-Agent, which Nominatim's usage policy requires on every request (see
// lib/geocoding.ts). proxy.ts already gates every non-/auth route behind a
// signed-in session; the explicit check below is defense-in-depth,
// consistent with every Server Action in the app re-checking
// supabase.auth.getUser() rather than relying on the proxy alone.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''

  // Mirrors the minimum length the client already enforces before firing a
  // request — guards a direct call to this route too, since Nominatim's
  // usage policy discourages throwaway single-character queries.
  if (query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = await searchNominatimCandidates(query)
  return NextResponse.json({ results })
}
